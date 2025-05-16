import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonAvatar, IonButton } from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonAvatar, IonButton, RouterModule],
})
export class ProfilePage implements OnInit {
  user: User = { name: '', avatar: '', description: '' };

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.getUser().subscribe((user) => {
      this.user = user;
    });
  }
}
