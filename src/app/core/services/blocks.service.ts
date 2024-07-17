import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  filter,
  first,
  forkJoin,
  map,
  Observable,
  ReplaySubject,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { Option } from '../../models/option.type';
import { HttpClient } from '@angular/common/http';
import { loremIpsumText } from '../constants/lorem-ipsum-text.constants';
import { TextRecord } from '../../models/text-record.type';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { sortingMethod } from '../utils/utils';

@Injectable({ providedIn: 'root' })
export class BlocksService {
  private readonly MINIMAL_INDEX = 2;
  private readonly MAXIMAL_INDEX = 5;

  private textRecordsFromJson$$ = new BehaviorSubject<TextRecord[] | null>(
    null
  );

  private optionSelected$$ = new ReplaySubject<Option>(1);
  private replaceButtonClicked$$ = new Subject<void>();
  private pasteButtonClicked$$ = new Subject<void>();

  private isPersonalDataDisplayed$$ = new BehaviorSubject<boolean>(false);
  private outputText$$ = new BehaviorSubject<string[]>([loremIpsumText]);

  private resetRadioButtons$$ = new Subject<void>();

  private lastUsedTextIndexForReplacement: number | undefined;
  private htmlDialogElement: HTMLDialogElement | undefined;

  constructor(private http: HttpClient) {
    this.getStringsFromJsonFile().pipe(takeUntilDestroyed()).subscribe();
    this.setupAppendTextStream$().pipe(takeUntilDestroyed()).subscribe();
    this.setupReplaceTextStream$().pipe(takeUntilDestroyed()).subscribe();
  }

  get optionSelected$(): Observable<Option> {
    return this.optionSelected$$
      .asObservable()
      .pipe(filter((optionSelectd) => optionSelectd !== null));
  }

  get replaceButtonClicked$(): Observable<void> {
    return this.replaceButtonClicked$$.asObservable();
  }

  get appendButtonClicked$(): Observable<void> {
    return this.pasteButtonClicked$$.asObservable();
  }

  get isPersonalDataDisplayed$() {
    return this.isPersonalDataDisplayed$$.asObservable();
  }

  get textRecordsFromJson$() {
    return this.textRecordsFromJson$$
      .asObservable()
      .pipe(filter((textRecordsFromJson) => textRecordsFromJson !== null));
  }

  get outputTexts$() {
    return this.outputText$$.asObservable();
  }

  get resetRadioButtons$() {
    return this.resetRadioButtons$$.asObservable();
  }

  emitOptionSelected(option: Option): void {
    this.optionSelected$$.next(option);
  }

  emitReplaceButtonClicked(): void {
    this.replaceButtonClicked$$.next();
  }

  emitPasteButtonClicked(): void {
    this.pasteButtonClicked$$.next();
  }

  setOutputTextDefaultValue(): void {
    this.outputText$$.next([loremIpsumText]);
  }

  setIsAuthorNameDisplayedTrue(): void {
    this.isPersonalDataDisplayed$$.next(true);
  }

  resetSettingsToDefault(): void {
    this.setAllTextsFromJsonAsNotDisplayed();
    this.isPersonalDataDisplayed$$.next(false);
    this.outputText$$.next([loremIpsumText]);
    this.resetRadioButtons$$.next();
  }

  forwardDialogReference(dialog: HTMLDialogElement): void {
    this.htmlDialogElement = dialog;
  }

  private setupAppendTextStream$() {
    return this.appendButtonClicked$.pipe(
      switchMap(() =>
        forkJoin([
          this.optionSelected$.pipe(first()),
          this.textRecordsFromJson$.pipe(first()),
        ])
      ),
      tap(([optionSelected, textRecordsFromJson]) => {
        if (textRecordsFromJson) {
          this.generateAppendedOutputText(optionSelected, textRecordsFromJson);
        }
      })
    );
  }

  private setupReplaceTextStream$() {
    return this.replaceButtonClicked$.pipe(
      switchMap(() =>
        forkJoin([
          this.optionSelected$.pipe(first()),
          this.textRecordsFromJson$.pipe(first()),
        ])
      ),
      tap(([optionSelected, textRecordsFromJson]) => {
        if (textRecordsFromJson) {
          this.generateReplacementText(optionSelected, textRecordsFromJson);
        }
      })
    );
  }

  private generateAppendedOutputText(
    optionSelected: Option,
    textRecordsFromJson: TextRecord[]
  ) {
    let textToAppend: string | null = null;
    let index: number;

    switch (optionSelected) {
      case 'firstOption':
        index = 0;
        textToAppend = this.getTextFromJsonToAppendAndSetItsFlag(
          textRecordsFromJson,
          index
        );

        break;
      case 'secondOption':
        index = 1;
        textToAppend = this.getTextFromJsonToAppendAndSetItsFlag(
          textRecordsFromJson,
          index
        );

        break;
      case 'thirdOption':
        let areThereNoMoreNotDisplayedValues: boolean;

        areThereNoMoreNotDisplayedValues = !textRecordsFromJson
          .slice(2, 6)
          .find((textRecord) => textRecord.isDisplayed === false);

        if (areThereNoMoreNotDisplayedValues) {
          break;
        }

        while (!textToAppend) {
          const randomIndex = this.generateRandomIndexFromRange();

          textToAppend = this.getTextFromJsonToAppendAndSetItsFlag(
            textRecordsFromJson,
            randomIndex
          );
        }
        break;

      default:
        throw Error('invalid option');
    }

    if (textToAppend === null) {
      this.htmlDialogElement?.showModal();
    }

    textToAppend
      ? this.outputText$$.next(
          this.outputText$$.value.concat(textToAppend).sort(sortingMethod)
        )
      : this.outputText$$.next(this.outputText$$.value.sort(sortingMethod));
  }

  private generateReplacementText(
    optionSelected: Option,
    textRecordsFromJson: TextRecord[]
  ): void {
    let replacementText: string | null = null;
    let index: number;

    switch (optionSelected) {
      case 'firstOption':
        index = 0;
        replacementText = this.getTextForReplacementFromJsonAndSetFlags(
          textRecordsFromJson,
          index
        );

        break;
      case 'secondOption':
        index = 1;
        replacementText = this.getTextForReplacementFromJsonAndSetFlags(
          textRecordsFromJson,
          index
        );

        break;
      case 'thirdOption':
        textRecordsFromJson = textRecordsFromJson.map((textRecord) => ({
          ...textRecord,
          isDisplayed: false,
        }));

        do {
          const randomIndex = this.generateRandomIndexFromRange();

          if (randomIndex !== this.lastUsedTextIndexForReplacement) {
            replacementText = this.getTextForReplacementFromJsonAndSetFlags(
              textRecordsFromJson,
              randomIndex
            );
          }
        } while (!replacementText);
        break;

      default:
        throw Error('invalid option');
    }

    this.lastUsedTextIndexForReplacement = textRecordsFromJson.findIndex(
      (textRecord) => textRecord.value === replacementText
    );

    replacementText
      ? this.outputText$$.next([replacementText])
      : this.outputText$$.next(this.outputText$$.value);
  }

  private getTextFromJsonToAppendAndSetItsFlag(
    textRecordsFromJson: TextRecord[],
    index: number
  ): string | null {
    let text: string | null = null;

    if (!textRecordsFromJson[index].isDisplayed) {
      text = textRecordsFromJson[index].value;

      textRecordsFromJson[index].isDisplayed = true;
      this.textRecordsFromJson$$.next(textRecordsFromJson);
    }

    return text;
  }

  private getTextForReplacementFromJsonAndSetFlags(
    textRecordsFromJson: TextRecord[],
    index: number
  ): string | null {
    let text: string | null = null;

    text = textRecordsFromJson[index].value;

    textRecordsFromJson = textRecordsFromJson.map((textRecord) => ({
      ...textRecord,
      isDisplayed: false,
    }));
    textRecordsFromJson[index].isDisplayed = true;

    this.textRecordsFromJson$$.next(textRecordsFromJson);

    return text;
  }

  private getStringsFromJsonFile() {
    return this.http
      .get<Record<string, TextRecord[]>>('./../../../assets/data.json')
      .pipe(
        map((data) => data['data']),
        tap((stringsFromJson) => {
          this.textRecordsFromJson$$.next(stringsFromJson);
        })
      );
  }

  private setAllTextsFromJsonAsNotDisplayed(): void {
    if (this.textRecordsFromJson$$.value) {
      const modifiedTextRecordsFromJson = this.textRecordsFromJson$$.value.map(
        (textRecords) => ({ ...textRecords, isDisplayed: false })
      );

      this.textRecordsFromJson$$.next(modifiedTextRecordsFromJson);
    }
  }

  private generateRandomIndexFromRange(): number {
    return Math.floor(
      Math.random() * (this.MAXIMAL_INDEX - this.MINIMAL_INDEX + 1) +
        this.MINIMAL_INDEX
    );
  }
}
