import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  imports: [],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  profileFlipped = false;

  toggleProfileCard(): void{
    this.profileFlipped = !this.profileFlipped;
  }
}
