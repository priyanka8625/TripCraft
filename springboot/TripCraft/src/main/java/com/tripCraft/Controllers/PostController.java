package com.tripCraft.Controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.tripCraft.Services.ImageUploadService;
import com.tripCraft.model.Post;
import com.tripCraft.repository.PostRepository;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private ImageUploadService imageUploadService;

    @PostMapping("/upload")
    public Post uploadPost(@RequestParam("image") MultipartFile file,
                           @RequestParam("caption") String caption,
                           @RequestParam("userId") String userId) throws IOException {
        String imageUrl = imageUploadService.uploadImage(file);

        Post post = new Post();
        post.setCaption(caption);
        post.setImageUrl(imageUrl);
        post.setUserId(userId); // set userId
        post.setLikes(0);

        return postRepository.save(post);
    }


    // Fetch all posts
    @GetMapping
    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    // Like a post
    @PostMapping("/{postId}/like")
    public Post likePost(@PathVariable String postId) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));
        post.setLikes(post.getLikes() + 1);
        return postRepository.save(post);
    }
}
