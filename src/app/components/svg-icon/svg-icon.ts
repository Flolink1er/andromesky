import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, inject, input, OnInit } from '@angular/core';

@Component({
  selector: 'app-svg-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './svg-icon.html'
})
export class SvgIconComponent implements OnInit {

  public readonly icon = input<string>();
  public readonly class = input<string>();
  private readonly http = inject(HttpClient);

  constructor(
    private el: ElementRef
  ) {}

  ngOnInit(): void {
    this.loadSvg();
  }

  loadSvg(): void {
    if (this.icon) {
      this.http.get(`/icons/${this.icon()}.svg`, { responseType: 'text' }).subscribe(
        svgContent => {
          this.insertSvgContent(svgContent);
        },
        error => {
          console.error('Error loading SVG:', error);
        }
      );
    }
  }

  insertSvgContent(svgContent: string): void {
    const svgContainer = this.el.nativeElement.querySelector('.svg-container');
    svgContainer.innerHTML = svgContent;

    const svgElement = svgContainer.querySelector('svg');
    if (svgElement) {
      svgElement.setAttribute('width', '100%');
      svgElement.setAttribute('height', '100%');
      svgElement.style.display = 'block';
      svgElement.classList.add('loaded-svg');
    }
  }
}
