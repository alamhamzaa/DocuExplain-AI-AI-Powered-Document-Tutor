package com.docuexplain;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins="http://localhost:5173")
public class ApiController {
 private final RagService service;
 public ApiController(RagService service){this.service=service;}
 @GetMapping("/health") public Map<String,String> health(){return Map.of("status","ok");}
 @GetMapping("/documents") public Object list(){return service.list();}
 @GetMapping("/documents/{id}") public Object get(@PathVariable Long id){return service.get(id);}
 @PostMapping(value="/documents",consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
 public Object upload(@RequestParam("file") MultipartFile file)throws Exception{return service.upload(file);}
 @DeleteMapping("/documents/{id}") public ResponseEntity<Void> delete(@PathVariable Long id){service.delete(id);return ResponseEntity.noContent().build();}
 public record Question(@NotBlank @Size(max=2000) String question){}
 @PostMapping("/documents/{id}/questions") public Object ask(@PathVariable Long id,@Valid @RequestBody Question body)throws Exception{return service.ask(id,body.question());}
 @GetMapping("/documents/{id}/history") public Object history(@PathVariable Long id){return service.history(id);}
}
