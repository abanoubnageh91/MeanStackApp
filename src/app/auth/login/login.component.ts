import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, OnDestroy {
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

  onLogin(form: NgForm) {
    if (form.valid) {
      this.isLoading = true;
      this.authService.login(form.value.email, form.value.password);
    }
  }
}
