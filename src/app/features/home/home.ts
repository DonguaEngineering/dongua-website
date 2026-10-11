import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LOCALIZED_ROUTES } from '../../core/i18n/localized-routes';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  readonly routes = LOCALIZED_ROUTES;
}
