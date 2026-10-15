package com.docuexplain;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
@RestControllerAdvice
public class ApiErrors {
 @ExceptionHandler(IllegalArgumentException.class) public ResponseEntity<?> bad(IllegalArgumentException e){return ResponseEntity.badRequest().body(Map.of("error",safe(e.getMessage())));}
 @ExceptionHandler(IllegalStateException.class) public ResponseEntity<?> state(IllegalStateException e){return ResponseEntity.badRequest().body(Map.of("error",safe(e.getMessage())));}
 @ExceptionHandler(MethodArgumentNotValidException.class) public ResponseEntity<?> validation(Exception e){return ResponseEntity.badRequest().body(Map.of("error","Question must contain 1–2,000 characters."));}
 @ExceptionHandler(Exception.class) public ResponseEntity<?> other(Exception e){return ResponseEntity.status(500).body(Map.of("error","Request failed. Check backend logs and API configuration."));}
 private String safe(String s){if(s==null||s.isBlank())return "Request could not be completed.";return s.substring(0,Math.min(500,s.length()));}
}
