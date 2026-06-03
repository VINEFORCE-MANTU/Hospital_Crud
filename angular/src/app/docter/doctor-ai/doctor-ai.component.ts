import {
  Component,
  Injector,
  ElementRef,
  HostListener,
  ViewChild
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { AppComponentBase } from '../../../shared/app-component-base';

import {
  DoctorCrudServiceServiceProxy,
  DoctorAiInputDto,
  DoctorAioutputDto
} from '../../../shared/service-proxies/service-proxies';

@Component({
  selector: 'app-doctor-ai',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doctor-ai.component.html',
  styleUrls: ['./doctor-ai.component.css']
})
export class DoctorAiComponent extends AppComponentBase {

  @ViewChild('chatWindow')
  chatWindow!: ElementRef;

  showChat = false;

  question = '';
  response = '';

  loading = false;

  constructor(
    injector: Injector,
    private doctorService: DoctorCrudServiceServiceProxy
  ) {
    super(injector);
  }

  openChat(event: Event): void {
    event.stopPropagation();
    this.showChat = true;
  }

  toggleChat(): void {
    this.showChat = !this.showChat;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {

    if (!this.showChat) {
      return;
    }

    const clickedInside =
      this.chatWindow?.nativeElement.contains(
        event.target
      );

    if (!clickedInside) {
      this.showChat = false;
    }
  }

  askAi(): void {

    if (!this.question?.trim()) {
      this.notify.warn('Please enter a question');
      return;
    }

    const currentQuestion = this.question;

    this.loading = true;

    const input = new DoctorAiInputDto();
    input.question = currentQuestion;

    this.doctorService
      .askAi(input)
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (result: DoctorAioutputDto) => {

          this.response = result.response;

          // Clear textbox after response
          this.question = '';

        },
        error: (error) => {

          console.error(error);

          this.notify.error('Failed to get AI response');

        }
      });
  }

  clearChat(): void {

    this.question = '';
    this.response = '';

  }
}