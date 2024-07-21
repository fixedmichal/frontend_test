import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appRandomColor]',
  standalone: true,
})
export class RandomColorDirective {
  private colors = ['#ee82ee', '#48beff', '#f29e4c'];

  constructor(private elRef: ElementRef) {
    const index = Math.floor(Math.random() * this.colors.length);
    this.elRef.nativeElement.style.color = this.colors[index] ?? '';
  }
}
