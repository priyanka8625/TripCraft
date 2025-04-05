package com.tripCraft.Controllers;


import com.tripCraft.Services.ImageUploadService;
import com.tripCraft.model.SnapSafari;
import com.tripCraft.model.SnapSafari.Comment;
import com.tripCraft.repository.SnapSafariRepository;
import com.tripCraft.repository.UserRepo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/snap-safari")
public class SnapSafariController {

    @Autowired
    private SnapSafariRepository snapSafariRepository;

    @Autowired
    private ImageUploadService imageUploadService;

    @Autowired
    private UserRepo userRepository;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadSnap(@RequestParam("userId") String userId,
                                                 @RequestParam("destination") String destination,
                                                 @RequestParam("title") String title,
                                                 @RequestParam("caption") String caption,
                                                 @RequestParam("images") List<MultipartFile> imageFiles) throws IOException {
    	 if (!userRepository.existsById(userId)) {
    	        Map<String, String> response = new HashMap<>();
    	        response.put("error", "User does not exist");
    	        return ResponseEntity.badRequest().body(response);
    	    }
        List<String> imageUrls = new ArrayList<>();
        for (MultipartFile file : imageFiles) {
            String imageUrl = imageUploadService.uploadImage(file);  // Actual Cloudinary upload
            imageUrls.add(imageUrl);
        }

        SnapSafari post = new SnapSafari();
        post.setUserId(userId);
        post.setDestination(destination);
        post.setTitle(title);
        post.setCaption(caption);
        post.setImages(imageUrls);
        post.setLikes(0);
        post.setCreatedAt(LocalDateTime.now());
        post.setComments(new ArrayList<>());

        return ResponseEntity.ok(snapSafariRepository.save(post));
    }

    // Get all posts
    @GetMapping
    public List<SnapSafari> getAllPosts() {
        return snapSafariRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    // Get post by ID
    @GetMapping("/{postId}")
    public SnapSafari getPostById(@PathVariable String postId) {
        return snapSafariRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
    }

    // Like a post
    @PostMapping("/{postId}/like")
    public SnapSafari likePost(@PathVariable String postId) {
        SnapSafari post = snapSafariRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        post.setLikes(post.getLikes() + 1);
        return snapSafariRepository.save(post);
    }

    // Comment on a post
    @PostMapping("/{postId}/comment")
    public ResponseEntity<Comment> addComment(@PathVariable String postId,
                                             
                                              @RequestParam("comment") String commentText) {
        SnapSafari post = snapSafariRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Comment comment = new Comment(post.getUserId(), commentText);
        post.getComments().add(comment);
        snapSafariRepository.save(post);

        return ResponseEntity.ok(comment);
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
