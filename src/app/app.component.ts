import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GridDisplayComponent, IRow } from './grid-display/grid-display.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, GridDisplayComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Stock Market Data';
}

