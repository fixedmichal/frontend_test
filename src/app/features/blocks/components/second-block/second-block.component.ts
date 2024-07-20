import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BlocksService } from '../../../../core/services/blocks.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-second-block',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './second-block.component.html',
  styleUrl: './second-block.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecondBlockComponent {
  private readonly blocksService = inject(BlocksService);

  protected isButtonClickedButNoOptionSelectedWarningDisplayed$ =
    this.blocksService.buttonClickedButNoOptionSelected$;

  onAppendButtonClick(): void {
    this.blocksService.emitPasteButtonClicked();
  }

  onReplaceButtonClick(): void {
    this.blocksService.emitReplaceButtonClicked();
  }
}
