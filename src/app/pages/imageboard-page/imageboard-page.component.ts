import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageboardComponent } from '../../components/imageboard/imageboard.component';

@Component({
  selector: 'app-imageboard-page',
  standalone: true,
  imports: [CommonModule, ImageboardComponent],
  template: `
    <div class="page-container">
      <app-imageboard></app-imageboard>
    </div>
  `,
  styles: [`
    .page-container {
      min-height: 100vh;
      background-color: #f9f9f9;
      padding-top: 2rem;
      padding-bottom: 2rem;
    }
  `]
})
export class ImageboardPageComponent {}