import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MenuComponent } from "../menu/menu.component";

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [MenuComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  isMenuDisplayed = false;

  onDisplayMenuClick(): void {
    this.isMenuDisplayed = !this.isMenuDisplayed;
  }
}
