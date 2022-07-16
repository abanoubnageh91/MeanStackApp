import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Post } from '../post.model';
import { PostsService } from '../posts.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css'],
})
export class PostListComponent implements OnInit, OnDestroy {
  constructor(
    private postsService: PostsService,
    private authService: AuthService
  ) {}
  ngOnDestroy(): void {
    this.postSub?.unsubscribe();
    this.authListenerSub?.unsubscribe();
  }
  posts: Post[] = [];
  postSub: Subscription | undefined;
  authListenerSub: Subscription | undefined;
  isLoading = false;
  postTotal = 0;
  pageSize = 2;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10];
  isAuthenticated: boolean = false;
  userId: string = '';
  ngOnInit(): void {
    this.isLoading = true;
    this.postsService.getPosts(this.pageSize, this.currentPage);
    this.userId = this.authService.getUserId();
    this.postSub = this.postsService
      .getPostUpdateListener()
      .subscribe((postData: { posts: Post[]; maxPosts: number }) => {
        this.isLoading = false;
        this.posts = postData.posts;
        this.postTotal = postData.maxPosts;
      });
    this.isAuthenticated = this.authService.getIsAuth();
    this.authListenerSub = this.authService
      .getTokenStatus()
      .subscribe((isAuthenticated) => {
        this.isAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();
      });
  }

  onPageChanged(event: PageEvent) {
    this.isLoading = true;
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex + 1;
    this.postsService.getPosts(this.pageSize, this.currentPage);
  }

  onDelete(postId: string) {
    this.isLoading = true;
    this.postsService.deletePost(postId).subscribe(
      () => {
        this.postsService.getPosts(this.pageSize, this.currentPage);
      },
      () => {
        this.isLoading = false;
      }
    );
  }
}
