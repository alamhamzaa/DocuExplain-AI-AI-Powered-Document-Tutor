package com.docuexplain;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
interface DocumentRepository extends JpaRepository<DocumentRecord,Long>{}
interface ChunkRepository extends JpaRepository<DocumentChunk,Long>{
 List<DocumentChunk> findByDocument_IdOrderByChunkIndexAsc(Long id);
 void deleteByDocument_Id(Long id);
}
interface ChatRepository extends JpaRepository<ChatMessage,Long>{
 List<ChatMessage> findByDocumentIdOrderByCreatedAtAsc(Long id);
 void deleteByDocumentId(Long id);
}
