import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  constructor(private authService: AuthService) {}
  private authListenerSub: Subscription = new Subscription();
  isAuthenticated: boolean = false;

  ngOnDestroy(): void {
    this.authListenerSub.unsubscribe();
  }
  ngOnInit(): void {
    this.isAuthenticated = this.authService.getIsAuth();
    this.authListenerSub = this.authService
      .getTokenStatus()
      .subscribe((isAuthenticted) => {
        this.isAuthenticated = isAuthenticted;
      });
  }

  onLogout() {
    this.authService.logout();
  }
}
