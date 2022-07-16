import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Post } from './post.model';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

const BACKEND_URL: string = environment.apiURL + '/posts';

@Injectable({ providedIn: 'root' })
export class PostsService {
  constructor(private http: HttpClient, private router: Router) {}
  private posts: Post[] = [];
  private postsUpdated = new Subject<{ posts: Post[]; maxPosts: number }>();
  getPosts(pageSize: number, page: number) {
    const postQuery = `?pageSize=${pageSize}&page=${page}`;
    this.http
      .get<{ message: string; posts: any; maxPosts: number }>(
        BACKEND_URL + postQuery
      )
      .pipe(
        map((postData) => {
          return {
            posts: postData.posts.map((post: any) => {
              return {
                id: post._id,
                title: post.title,
                content: post.content,
                imagePath: post.imagePath,
                creator: post.creator,
              };
            }),
            maxPosts: postData.maxPosts,
          };
        })
      )
      .subscribe((transformedPosts) => {
        this.posts = transformedPosts.posts;
        this.postsUpdated.next({
          posts: [...this.posts],
          maxPosts: transformedPosts.maxPosts,
        });
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(title: string, content: string, file: File) {
    let postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', file, title);
    this.http
      .post<{ message: string; post: Post }>(BACKEND_URL, postData)
      .subscribe((res) => {
        // let post: any = {
        //   id: res.post.id,
        //   title: title,
        //   content: content,
        //   imagePath: res.post.imagePath,
        // };
        // this.posts.push(post);
        // this.postsUpdated.next([...this.posts]);
        this.router.navigate(['/']);
      });
  }

  getPost(id: string) {
    return this.http.get<{
      _id: string;
      title: string;
      content: string;
      imagePath: string;
      creator: string;
    }>(`${BACKEND_URL}/${id}`);
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;
    if (typeof image === 'object') {
      postData = new FormData();
      postData.append('id', id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      postData = {
        id: id,
        title: title,
        content: content,
        imagePath: image,
        creator: '',
      };
    }
    this.http.put(`${BACKEND_URL}/${id}`, postData).subscribe((res) => {
      // const updatedPosts = [...this.posts];
      // const oldPostIndex = updatedPosts.findIndex((p) => p.id === id);
      // const post: Post = {
      //   id: id,
      //   title: title,
      //   content: content,
      //   imagePath: '',
      // };
      // updatedPosts[oldPostIndex] = post;
      // this.posts = updatedPosts;
      // this.postsUpdated.next([...this.posts]);
      this.router.navigate(['/']);
    });
  }

  deletePost(postId: string) {
    return this.http.delete(`${BACKEND_URL}/${postId}`);
  }
}
