import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from 'src/app/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private key = 'user';

  private userSubjet = new BehaviorSubject<User>(this.loadUser());

  constructor() {}

  private loadUser(): User {
    const userInfo = localStorage.getItem(this.key);
    return userInfo
      ? JSON.parse(userInfo)
      : { name: '', avatar: '', description: '' };
  }

  getUser(): Observable<User> {
    return this.userSubjet.asObservable();
  }

  setUser(user: User): Observable<User> {
    localStorage.setItem(this.key, JSON.stringify(user));
    this.userSubjet.next(user);
    return this.getUser();
  }
}
