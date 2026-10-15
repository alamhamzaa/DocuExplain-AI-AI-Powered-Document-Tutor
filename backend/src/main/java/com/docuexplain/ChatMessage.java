package com.docuexplain;
import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name="chat_messages")
public class ChatMessage {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 private Long documentId; private String role;
 @Column(nullable=false,columnDefinition="MEDIUMTEXT") private String content;
 @Column(columnDefinition="TEXT") private String citationsJson;
 private Instant createdAt=Instant.now();
 public Long getId(){return id;} public Long getDocumentId(){return documentId;} public void setDocumentId(Long v){documentId=v;}
 public String getRole(){return role;} public void setRole(String v){role=v;}
 public String getContent(){return content;} public void setContent(String v){content=v;}
 public String getCitationsJson(){return citationsJson;} public void setCitationsJson(String v){citationsJson=v;}
 public Instant getCreatedAt(){return createdAt;}
}
