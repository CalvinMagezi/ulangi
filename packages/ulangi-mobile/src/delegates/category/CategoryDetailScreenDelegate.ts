/*
 * Copyright (c) Minh Loi.
 *
 * This file is part of Ulangi which is released under GPL v3.0.
 * See LICENSE or go to https://www.gnu.org/licenses/gpl-3.0.txt
 */

import { ActionType } from '@ulangi/ulangi-action';
import { ScreenName } from '@ulangi/ulangi-common/enums';
import { EventBus, group, on } from '@ulangi/ulangi-event';
import {
  ObservableCategoryDetailScreen,
  ObservableVocabulary,
} from '@ulangi/ulangi-observable';
import { boundClass } from 'autobind-decorator';

import { CategoryActionMenuDelegate } from '../category/CategoryActionMenuDelegate';
import { FeatureSettingsDelegate } from '../learn/FeatureSettingsDelegate';
import { NavigatorDelegate } from '../navigator/NavigatorDelegate';
import { VocabularyActionMenuDelegate } from '../vocabulary/VocabularyActionMenuDelegate';
import { VocabularyBulkActionMenuDelegate } from '../vocabulary/VocabularyBulkActionMenuDelegate';
import { VocabularyFilterMenuDelegate } from '../vocabulary/VocabularyFilterMenuDelegate';
import { VocabularyListDelegate } from '../vocabulary/VocabularyListDelegate';
import { VocabularyLiveUpdateDelegate } from '../vocabulary/VocabularyLiveUpdateDelegate';
import { VocabularySelectionDelegate } from '../vocabulary/VocabularySelectionDelegate';
import { VocabularySortMenuDelegate } from '../vocabulary/VocabularySortMenuDelegate';

@boundClass
export class CategoryDetailScreenDelegate {
  private eventBus: EventBus;
  private observableScreen: ObservableCategoryDetailScreen;
  private categoryActionMenuDelegate: CategoryActionMenuDelegate;
  private vocabularyListDelegate: VocabularyListDelegate;
  private vocabularyFilterMenuDelegate: VocabularyFilterMenuDelegate;
  private vocabularySortMenuDelegate: VocabularySortMenuDelegate;
  private vocabularyActionMenuDelegate: VocabularyActionMenuDelegate;
  private vocabularyBulkActionMenuDelegate: VocabularyBulkActionMenuDelegate;
  private vocabularyLiveUpdateDelegate: VocabularyLiveUpdateDelegate;
  private vocabularySelectionDelegate: VocabularySelectionDelegate;
  private featureSettingsDelegate: FeatureSettingsDelegate;
  private navigatorDelegate: NavigatorDelegate;

  public constructor(
    eventBus: EventBus,
    observableScreen: ObservableCategoryDetailScreen,
    categoryActionMenuDelegate: CategoryActionMenuDelegate,
    vocabularyListDelegate: VocabularyListDelegate,
    vocabularyFilterMenuDelegate: VocabularyFilterMenuDelegate,
    vocabularySortMenuDelegate: VocabularySortMenuDelegate,
    vocabularyActionMenuDelegate: VocabularyActionMenuDelegate,
    vocabularyBulkActionMenuDelegate: VocabularyBulkActionMenuDelegate,
    vocabularyLiveUpdateDelegate: VocabularyLiveUpdateDelegate,
    vocabularySelectionDelegate: VocabularySelectionDelegate,
    featureSettingsDelegate: FeatureSettingsDelegate,
    navigatorDelegate: NavigatorDelegate,
  ) {
    this.eventBus = eventBus;
    this.observableScreen = observableScreen;
    this.categoryActionMenuDelegate = categoryActionMenuDelegate;
    this.vocabularyListDelegate = vocabularyListDelegate;
    this.vocabularyFilterMenuDelegate = vocabularyFilterMenuDelegate;
    this.vocabularySortMenuDelegate = vocabularySortMenuDelegate;
    this.vocabularyActionMenuDelegate = vocabularyActionMenuDelegate;
    this.vocabularyBulkActionMenuDelegate = vocabularyBulkActionMenuDelegate;
    this.vocabularyLiveUpdateDelegate = vocabularyLiveUpdateDelegate;
    this.vocabularySelectionDelegate = vocabularySelectionDelegate;
    this.featureSettingsDelegate = featureSettingsDelegate;
    this.navigatorDelegate = navigatorDelegate;
  }

  public prepareAndFetch(): void {
    this.vocabularyListDelegate.prepareAndFetch(
      this.observableScreen.selectedFilterType.get(),
      this.observableScreen.selectedSortType.get(),
      [this.observableScreen.category.categoryName],
    );
  }

  public fetch(): void {
    this.vocabularyListDelegate.fetch();
  }

  public clearFetch(): void {
    this.vocabularyListDelegate.clearFetch();
  }

  public refresh(): void {
    this.vocabularyListDelegate.refresh(
      this.observableScreen.selectedFilterType.get(),
      this.observableScreen.selectedSortType.get(),
      [this.observableScreen.category.categoryName],
    );
  }

  public autoUpdateEditedVocabulary(): void {
    this.vocabularyLiveUpdateDelegate.autoUpdateEditedVocabulary(true, true);
  }

  public autoRefreshOnMultipleEdit(): void {
    this.eventBus.subscribe(
      on(
        [
          ActionType.VOCABULARY__ADD_MULTIPLE_SUCCEEDED,
          ActionType.VOCABULARY__BULK_EDIT_SUCCEEDED,
          ActionType.VOCABULARY__EDIT_MULTIPLE_SUCCEEDED,
        ],
        (): void => {
          this.refresh();
        },
      ),
    );
  }

  public autoShowRefreshNotice(): void {
    this.eventBus.subscribe(
      on(
        [
          ActionType.VOCABULARY__ADD_SUCCEEDED,
          ActionType.VOCABULARY__EDIT_SUCCEEDED,
          ActionType.VOCABULARY__DOWNLOAD_VOCABULARY_SUCCEEDED,
          ActionType.VOCABULARY__DOWNLOAD_INCOMPATIBLE_VOCABULARY_SUCCEEDED,
        ],
        (): void => {
          this.observableScreen.vocabularyListState.shouldShowRefreshNotice.set(
            true,
          );
        },
      ),
    );
  }

  public autoShowSyncingInProgress(): void {
    this.eventBus.subscribe(
      group(
        on(
          [ActionType.SYNC__STOP, ActionType.SYNC__SYNC_COMPLETED],
          (): void => {
            this.observableScreen.vocabularyListState.shouldShowSyncingNotice.set(
              false,
            );
          },
        ),
        on(
          ActionType.SYNC__SYNCING,
          (): void => {
            this.observableScreen.vocabularyListState.shouldShowSyncingNotice.set(
              true,
            );
          },
        ),
      ),
    );
  }

  public showVocabularyDetail(vocabulary: ObservableVocabulary): void {
    this.navigatorDelegate.showModal(ScreenName.VOCABULARY_DETAIL_SCREEN, {
      vocabulary,
    });
  }

  public toggleSelection(vocabularyId: string): void {
    this.vocabularySelectionDelegate.toggleSelection(vocabularyId);
  }

  public clearSelections(): void {
    this.vocabularySelectionDelegate.clearSelections();
  }

  public showCategoryActionMenu(): void {
    const featureSettings = this.featureSettingsDelegate.getCurrentSettings();

    this.categoryActionMenuDelegate.show(
      this.observableScreen.category,
      this.observableScreen.selectedFilterType.get(),
      {
        hideViewDetailButton: true,
        hideReviewBySpacedRepetitionButton: !featureSettings.spacedRepetitionEnabled,
        hideReviewByWritingButton: !featureSettings.writingEnabled,
        hideQuizButton: !featureSettings.quizEnabled,
        hidePlayReflexButton: !featureSettings.reflexEnabled,
        hidePlayAtomButton: !featureSettings.atomEnabled,
      },
    );
  }

  public showVocabularyFilterMenu(): void {
    const featureSettings = this.featureSettingsDelegate.getCurrentSettings();

    this.vocabularyFilterMenuDelegate.show(
      this.observableScreen.selectedFilterType.get(),
      (filterType): void => {
        this.observableScreen.selectedFilterType.set(filterType);
        this.refresh();
      },
      {
        hideDueBySpacedRepetition: !featureSettings.spacedRepetitionEnabled,
        hideDueByWriting: !featureSettings.writingEnabled,
      },
    );
  }

  public showVocabularySortMenu(): void {
    this.vocabularySortMenuDelegate.show(
      this.observableScreen.selectedSortType.get(),
      (sortType): void => {
        this.observableScreen.selectedSortType.set(sortType);
        this.refresh();
      },
    );
  }

  public showVocabularyActionMenu(vocabulary: ObservableVocabulary): void {
    this.vocabularyActionMenuDelegate.show(vocabulary);
  }

  public showVocabularyBulkActionMenu(): void {
    this.vocabularyBulkActionMenuDelegate.show();
  }
}
