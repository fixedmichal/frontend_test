import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-third-block',
  standalone: true,
  imports: [],
  templateUrl: './third-block.component.html',
  styleUrl: './third-block.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThirdBlockComponent {}
