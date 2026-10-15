package com.docuexplain;
import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name="documents")
public class DocumentRecord {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false) private String filename;
 @Column(nullable=false) private String status="PROCESSING";
 private Integer pageCount; private Integer chunkCount;
 @Column(length=1000) private String errorMessage;
 @Column(nullable=false) private Instant createdAt=Instant.now();
 public Long getId(){return id;} public String getFilename(){return filename;} public void setFilename(String v){filename=v;}
 public String getStatus(){return status;} public void setStatus(String v){status=v;}
 public Integer getPageCount(){return pageCount;} public void setPageCount(Integer v){pageCount=v;}
 public Integer getChunkCount(){return chunkCount;} public void setChunkCount(Integer v){chunkCount=v;}
 public String getErrorMessage(){return errorMessage;} public void setErrorMessage(String v){errorMessage=v;}
 public Instant getCreatedAt(){return createdAt;}
}
