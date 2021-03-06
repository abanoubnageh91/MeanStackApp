import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NgForm,
  RequiredValidator,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { mimeType } from './mime-type.validator';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css'],
})
export class PostCreateComponent implements OnInit, OnDestroy {
  constructor(
    private postsService: PostsService,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}
  mode: string = 'create';
  enteredTitle = '';
  enteredContent = '';
  post: any;
  postId: any;
  isLoading = false;
  form: FormGroup = new FormGroup({});
  imagePreview: string = '';
  private authListenerSub: Subscription = new Subscription();
  ngOnDestroy(): void {
    this.authListenerSub.unsubscribe();
  }
  ngOnInit(): void {
    this.authListenerSub = this.authService
      .getTokenStatus()
      .subscribe((isAuthenticted) => {
        this.isLoading = false;
      });

    this.form = new FormGroup({
      title: new FormControl(null, { validators: [Validators.required] }),
      content: new FormControl(null, { validators: [Validators.required] }),
      image: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType],
      }),
    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = `${paramMap.get('postId')}`;
        this.isLoading = true;
        this.postsService.getPost(this.postId).subscribe((postData) => {
          this.post = {
            id: postData._id,
            title: postData.title,
            content: postData.content,
            imagePath: postData.imagePath,
            creator: postData.creator,
          };
          this.isLoading = false;
          this.form.setValue({
            title: this.post.title,
            content: this.post.content,
            image: this.post.imagePath,
          });
        });
      } else {
        this.mode = 'create';
        this.postId = null;
      }
    });
  }
  onAddPost() {
    if (this.form.valid) {
      this.isLoading = true;
      if (this.mode == 'create')
        this.postsService.addPost(
          this.form.value.title,
          this.form.value.content,
          this.form.value.image
        );
      else
        this.postsService.updatePost(
          this.postId,
          this.form.value.title,
          this.form.value.content,
          this.form.value.image
        );
      this.form.reset();
    }
  }

  onImagePicked(event: Event) {
    const files = (event.target as HTMLInputElement)?.files;
    if (!!files) {
      this.form.patchValue({ image: files[0] });
      this.form.get('image')?.updateValueAndValidity();
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(files[0]);
    }
  }
}
