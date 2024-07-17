import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BlocksService } from '../../services/blocks.service';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [AsyncPipe, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private readonly blocksService = inject(BlocksService);

  protected isPersonalDataDisplayed$ =
    this.blocksService.isPersonalDataDisplayed$;
}
