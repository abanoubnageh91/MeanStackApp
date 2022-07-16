import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';

@Component({
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit, OnDestroy {
  constructor(private authService: AuthService) {}
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
  }
  isLoading = false;

  onSignup(form: NgForm) {
    if (form.valid) {
      this.isLoading = true;
      this.authService.createUser(form.value.email, form.value.password);
    }
  }
}
