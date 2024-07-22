import { NgClass, AsyncPipe } from '@angular/common';
import { BlocksService } from './../../services/blocks.service';
import { Component, inject, OnInit, ElementRef } from '@angular/core';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [AsyncPipe, NgClass],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
})
export class DialogComponent implements OnInit {
  private readonly blocksService = inject(BlocksService);

  ngOnInit(): void {
    this.setupDialog();
  }

  private setupDialog(): void {
    const dialog = document.querySelector<HTMLDialogElement>('dialog');

    if (dialog) {
      const closeDialogButton = dialog.querySelector('.dialog__button');

      closeDialogButton?.addEventListener('click', () => {
        dialog.close();
      });

      this.blocksService.setDialogReference(dialog);
    }
  }
}
