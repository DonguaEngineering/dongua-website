import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LOCALIZED_ROUTES } from '../../core/i18n/localized-routes';

@Component({
  selector: 'app-industries',
  imports: [RouterLink],
  templateUrl: './industries.html',
  styleUrl: './industries.scss',
})
export class Industries {
  readonly routes = LOCALIZED_ROUTES;
}
