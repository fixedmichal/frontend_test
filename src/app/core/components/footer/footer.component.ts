import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BlocksService } from '../../services/blocks.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [NgClass],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  private readonly blocksService = inject(BlocksService);
  isMenuDisplayed = false;

  onDisplayMenuClick(): void {
    this.isMenuDisplayed = !this.isMenuDisplayed;
  }

  onShowPersonalDataClick(): void {
    this.blocksService.setIsAuthorNameDisplayedTrue();
  }

  onResetSettingsClick(): void {
    this.blocksService.resetSettingsToDefault();
  }
}
