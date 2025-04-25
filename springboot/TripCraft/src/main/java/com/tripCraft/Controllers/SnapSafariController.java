package com.tripCraft.Controllers;


import com.tripCraft.Services.ImageUploadService;
import com.tripCraft.model.SnapSafari;
import com.tripCraft.model.SnapSafari.Comment;
import com.tripCraft.model.User;
import com.tripCraft.repository.SnapSafariRepository;
import com.tripCraft.repository.UserRepo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/snap-safari")
public class SnapSafariController {

    @Autowired
    private SnapSafariRepository snapSafariRepository;

    @Autowired
    private ImageUploadService imageUploadService;

    @Autowired
    private TripController tripController;
    @Autowired
    private UserRepo userRepository;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadSnap(
                                                 @RequestParam("destination") String destination,
                                                 @RequestParam("title") String title,
                                                 @RequestParam("caption") String caption,
                                                 @RequestParam("images") List<MultipartFile> imageFiles) throws IOException {
    	
    	
    	try {
            String userEmail = tripController.getCurrentUserId(); // Returns email, e.g., "test@example.com"
            Optional<User> userOptional = userRepository.findByEmail(userEmail);
            if (!userOptional.isPresent()) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "User does not exist");
                return ResponseEntity.badRequest().body(response);
            }

            User user = userOptional.get();
            String userId = user.getId(); // Get the MongoDB _id (e.g., "user123")

            List<String> imageUrls = new ArrayList<>();
            for (MultipartFile file : imageFiles) {
                String imageUrl = imageUploadService.uploadImage(file);
                imageUrls.add(imageUrl);
            }

            SnapSafari post = new SnapSafari();
            post.setUserId(userId); // Use the actual _id
            post.setDestination(destination);
            post.setTitle(title);
            post.setCaption(caption);
            post.setImages(imageUrls);
            post.setCreatedAt(LocalDateTime.now());
            post.setLikes(0);

            return ResponseEntity.ok().body(snapSafariRepository.save(post));
        } catch (IllegalStateException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Unauthenticated: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to upload post: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
//    	if (!userRepository.existsById(userId)) {
//    	        Map<String, String> response = new HashMap<>();
//    	        response.put("error", "User does not exist");
//    	        return ResponseEntity.badRequest().body(response);
//    	    }
//        List<String> imageUrls = new ArrayList<>();
//        for (MultipartFile file : imageFiles) {
//            String imageUrl = imageUploadService.uploadImage(file);  // Actual Cloudinary upload
//            imageUrls.add(imageUrl);
//        }
//
//        SnapSafari post = new SnapSafari();
//        post.setUserId(userId);
//        post.setDestination(destination);
//        post.setTitle(title);
//        post.setCaption(caption);
//        post.setImages(imageUrls);
//        post.setLikes(0);
//        post.setCreatedAt(LocalDateTime.now());
//        post.setComments(new ArrayList<>());
//
////        return ResponseEntity.ok(snapSafariRepository.save(post));
//        return ResponseEntity.ok().body(snapSafariRepository.save(post));
    }

    // Get all posts
    @GetMapping
    public ResponseEntity<List<SnapSafari>> getAllPosts() {
        List<SnapSafari> posts = snapSafariRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        
        if (posts.isEmpty()) {
            return ResponseEntity.noContent().build(); // 204 No Content
        } else {
            return ResponseEntity.ok(posts); // 200 OK with list
        }
    }


    // Get post by ID
    @GetMapping("/{postId}")
    public ResponseEntity<?> getPostById(@PathVariable String postId) {
        Optional<SnapSafari> optionalPost = snapSafariRepository.findById(postId);

        if (optionalPost.isPresent()) {
            return ResponseEntity.ok(optionalPost.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                 .body(Map.of("error", "Post not found"));
        }
    }

    @GetMapping("/user")
    public ResponseEntity<List<SnapSafari>> getPostsByUserId() {
    	String userEmail = tripController.getCurrentUserId(); // Returns email, e.g., "test@example.com"
        Optional<User> userOptional = userRepository.findByEmail(userEmail);
        
        User user = userOptional.get();
        String userId = user.getId(); // Get the MongoDB _id (e.g., "user123")
        
        List<SnapSafari> posts = snapSafariRepository.findByUserId(userId);
        
        if (posts.isEmpty()) {
            return ResponseEntity.noContent().build(); // 204 No Content
        } else {
            return ResponseEntity.ok(posts); // 200 OK with JSON
        }
    }

    // Like a post
    @PostMapping("/{postId}/like")
    public ResponseEntity<?> likePost(@PathVariable String postId) {
        Optional<SnapSafari> post = snapSafariRepository.findById(postId);
        if(post.isEmpty()) {
        	return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error","Post not found"));
        }
                
        post.get().setLikes((post.get()).getLikes() + 1);
        return ResponseEntity.ok(snapSafariRepository.save(post.get()));
    }

    // Comment on a post
    @PostMapping("/{postId}/comment")
    public ResponseEntity<?> addComment(@PathVariable String postId,
                                        @RequestParam("comment") String commentText) {
        Optional<SnapSafari> optionalPost = snapSafariRepository.findById(postId);
        
        String userEmail = tripController.getCurrentUserId(); // Returns email, e.g., "test@example.com"
        Optional<User> userOptional = userRepository.findByEmail(userEmail);
        
        User user = userOptional.get();
        String userId = user.getId(); // Get the MongoDB _id (e.g., "user123")
        String name=user.getName();
        if (optionalPost.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Post not found"));
        }

        SnapSafari post = optionalPost.get();

        // Initialize comments list if null
        if (post.getComments() == null) {
            post.setComments(new ArrayList<>());
        }

        Comment comment = new Comment(userId,name, commentText); // Include username
        post.getComments().add(comment);
        snapSafariRepository.save(post);
        return ResponseEntity.status(HttpStatus.CREATED).body(comment);
    }

    // Delete post
    @DeleteMapping("/{postId}")
  
    public ResponseEntity<Map<String, String>> deletePost(@PathVariable String postId) {
        Map<String, String> response = new HashMap<>();

        if (!snapSafariRepository.existsById(postId)) {
            response.put("error", "Post not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        snapSafariRepository.deleteById(postId);
        response.put("message", "Post deleted successfully");
        return ResponseEntity.ok(response);
    }

}