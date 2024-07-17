import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BlocksService } from '../../../../core/services/blocks.service';

@Component({
  selector: 'app-second-block',
  standalone: true,
  imports: [],
  templateUrl: './second-block.component.html',
  styleUrl: './second-block.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecondBlockComponent {
  private readonly service = inject(BlocksService);

  onAppendButtonClick(): void {
    this.service.emitPasteButtonClicked();
  }

  onReplaceButtonClick(): void {
    this.service.emitReplaceButtonClicked();
  }
}
