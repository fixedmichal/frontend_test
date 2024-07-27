import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
} from '@angular/core';
import { BlocksService } from '../../services/blocks.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [NgClass],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent {
  @Input({ required: true }) isMenuDisplayed = false;

  private readonly blocksService = inject(BlocksService);

  onShowPersonalDataClick(): void {
    this.blocksService.setIsAuthorNameDisplayedTrue();
  }

  onResetSettingsClick(): void {
    this.blocksService.resetSettingsToDefault();
  }
}
