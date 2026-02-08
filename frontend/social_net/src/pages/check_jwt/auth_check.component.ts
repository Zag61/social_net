import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'app-simple-auth-check',
  imports: [CommonModule],
  template: `
    <div style="padding: 20px;">
      <h2>Auth Check</h2>
      
      <div *ngIf="loading">Checking...</div>
      
      <div *ngIf="!loading">
        <h3 style="color: green;">✅ Authorized</h3>
        <pre>{{ authData | json }}</pre>
      </div>
      
      <div *ngIf="error">
        <h3 style="color: red;">❌ {{ error }}</h3>
      </div>
      
      <button (click)="check()" [disabled]="loading">
        Check Auth
      </button>
    </div>
  `
})
export class SimpleAuthCheckComponent implements OnInit {
  loading = false;
  authData: any = null;
  error = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.check();
  }
  

  async check() {
  this.loading =true;
  this.error = '';
  this.authData='';

  try {
    // Get the token from the cookie
    // console.log('here')
    const token = getCookie('access_token');

    const response = await fetch('http://localhost:3000/auth/check-token', {
      method: 'POST',
      credentials: 'include', // We still send the cookie, but also set the header
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': token, // This should be "Bearer <token>"
      },
    });



    const data = await response.json();
    console.log(data)
    if (response.ok) {
      this.authData = data;
      console.log('Auth check successful:', data);
    } else {
      this.error=(data.message || 'Not authorized');
    }
  } catch (err: any) {
    this.error=(err.message || 'Error checking auth status');
  } finally {
    this.loading=(false);
  }
}
}
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}