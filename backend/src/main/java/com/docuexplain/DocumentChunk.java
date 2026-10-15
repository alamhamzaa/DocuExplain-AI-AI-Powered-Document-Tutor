package com.docuexplain;
import jakarta.persistence.*;
@Entity @Table(name="document_chunks", indexes=@Index(name="idx_chunk_document",columnList="document_id"))
public class DocumentChunk {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="document_id") private DocumentRecord document;
 private Integer chunkIndex; private Integer pageNumber;
 @Column(nullable=false,columnDefinition="MEDIUMTEXT") private String content;
 @Column(nullable=false,columnDefinition="LONGTEXT") private String embeddingJson;
 public Long getId(){return id;} public DocumentRecord getDocument(){return document;} public void setDocument(DocumentRecord v){document=v;}
 public Integer getChunkIndex(){return chunkIndex;} public void setChunkIndex(Integer v){chunkIndex=v;}
 public Integer getPageNumber(){return pageNumber;} public void setPageNumber(Integer v){pageNumber=v;}
 public String getContent(){return content;} public void setContent(String v){content=v;}
 public String getEmbeddingJson(){return embeddingJson;} public void setEmbeddingJson(String v){embeddingJson=v;}
}
