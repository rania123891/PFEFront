import { Component } from '@angular/core';

@Component({
  selector: 'ngx-projet',
  template: `
    <nb-layout>
      <nb-layout-column class="colored-column-basic">
        <router-outlet></router-outlet>
      </nb-layout-column>
    </nb-layout>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }

    nb-layout-column {
      padding: 2.25rem;
    }
  `],
})
export class ProjetComponent {} 