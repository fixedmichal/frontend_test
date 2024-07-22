import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HeaderComponent } from './core/components/header/header.component';
import { FooterComponent } from './core/components/footer/footer.component';
import { FirstBlockComponent } from './features/blocks/components/first-block/first-block.component';
import { SecondBlockComponent } from './features/blocks/components/second-block/second-block.component';
import { ThirdBlockComponent } from './features/blocks/components/third-block/third-block.component';
import { BlocksService } from './core/services/blocks.service';
import { AsyncPipe } from '@angular/common';
import { RandomColorDirective } from './features/blocks/directives/random-color.directive';
import { DialogComponent } from './core/components/dialog/dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    AsyncPipe,
    HeaderComponent,
    FooterComponent,
    FirstBlockComponent,
    SecondBlockComponent,
    ThirdBlockComponent,
    RandomColorDirective,
    DialogComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly blocksService = inject(BlocksService);

  protected projectedContentTexts$ = this.blocksService.outputTexts$;
}
