/*
 * Copyright (c) Minh Loi.
 *
 * This file is part of Ulangi which is released under GPL v3.0.
 * See LICENSE or go to https://www.gnu.org/licenses/gpl-3.0.txt
 */

import { Request } from './Request';

export interface SearchNativeSetsRequest extends Request {
  readonly path: '/search-native-sets';
  readonly method: 'get';
  readonly authRequired: true;
  readonly query: {
    readonly languageCodePair: string;
    readonly searchTerm: string;
    readonly offset: number;
    readonly limit: number;
  };
  readonly body: null;
}
