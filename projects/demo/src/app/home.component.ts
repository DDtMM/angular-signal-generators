import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HighlightModule } from 'ngx-highlightjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HighlightModule, RouterLink],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent { }
