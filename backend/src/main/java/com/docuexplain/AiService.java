package com.docuexplain;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import java.util.*;

@Service
public class AiService {
 private final RestClient client; private final ObjectMapper mapper;
 @Value("${ai.api-key}") private String apiKey;
 @Value("${ai.chat-model}") private String chatModel;
 @Value("${ai.embedding-model}") private String embeddingModel;
 public AiService(@Value("${ai.base-url}") String baseUrl,ObjectMapper mapper){
  this.mapper=mapper; this.client=RestClient.builder().baseUrl(baseUrl).build();
 }
 private void requireKey(){if(apiKey==null||apiKey.isBlank())throw new IllegalStateException("AI_API_KEY is not configured. Set it in your terminal before uploading or asking questions.");}
 public List<float[]> embed(List<String> texts) throws Exception {
  requireKey(); List<float[]> out=new ArrayList<>();
  for(int off=0;off<texts.size();off+=64){
   List<String> batch=texts.subList(off,Math.min(off+64,texts.size()));
   Map<?,?> body=client.post().uri("/embeddings").header("Authorization","Bearer "+apiKey)
    .contentType(MediaType.APPLICATION_JSON).body(Map.of("model",embeddingModel,"input",batch)).retrieve().body(Map.class);
   JsonNode data=mapper.valueToTree(body).path("data"); float[][] ordered=new float[batch.size()][];
   for(JsonNode item:data){int i=item.path("index").asInt(-1); JsonNode e=item.path("embedding"); if(i<0||i>=ordered.length||!e.isArray())throw new IllegalStateException("Invalid embedding response.");
    ordered[i]=new float[e.size()]; for(int j=0;j<e.size();j++)ordered[i][j]=(float)e.get(j).asDouble();}
   for(float[] v:ordered){if(v==null)throw new IllegalStateException("Missing embedding vector.");out.add(v);}
  } return out;
 }
 public String chat(String system,String user) throws Exception {
  requireKey();
  Map<?,?> body=client.post().uri("/chat/completions").header("Authorization","Bearer "+apiKey)
   .contentType(MediaType.APPLICATION_JSON).body(Map.of("model",chatModel,"temperature",0.1,
    "response_format",Map.of("type","json_object"),
    "messages",List.of(Map.of("role","system","content",system),Map.of("role","user","content",user))))
   .retrieve().body(Map.class);
  String answer=mapper.valueToTree(body).path("choices").path(0).path("message").path("content").asText("");
  if(answer.isBlank())throw new IllegalStateException("AI provider returned an empty answer.");
  return answer;
 }
}
