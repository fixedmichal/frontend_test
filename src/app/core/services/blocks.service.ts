import { TextRecord } from './../../models/text-record.type';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  filter,
  first,
  forkJoin,
  map,
  merge,
  Observable,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { Option } from '../../models/option.type';
import { HttpClient } from '@angular/common/http';
import { loremIpsumText } from '../constants/lorem-ipsum-text.constants';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  generateRandomIndexOfArrayIndexes,
  isTextRecordArray,
  sortingStringsMethod,
} from '../utils/utils';

@Injectable({ providedIn: 'root' })
export class BlocksService {
  private readonly TEXT_RECORDS_STORAGE_KEY = 'textRecords';

  private textRecords$$ = new BehaviorSubject<TextRecord[] | null>(null);

  private htmlDialogElement: HTMLDialogElement | undefined;

  private optionSelected$$ = new BehaviorSubject<Option | null>(null);
  private replaceButtonClicked$$ = new Subject<void>();
  private pasteButtonClicked$$ = new Subject<void>();

  private isPersonalDataDisplayed$$ = new BehaviorSubject<boolean>(false);

  private resetRadioButtons$$ = new Subject<void>();

  private lastUsedTextIndexForReplacement: number | undefined;

  constructor(private http: HttpClient) {
    this.emitTextRecordsFromStorageOrFile();

    this.setupAppendTextStream$().pipe(takeUntilDestroyed()).subscribe();
    this.setupReplaceTextStream$().pipe(takeUntilDestroyed()).subscribe();
  }

  get optionSelected$(): Observable<Option> {
    return this.optionSelected$$
      .asObservable()
      .pipe(filter((optionSelectd) => optionSelectd !== null));
  }

  get buttonClickedButNoOptionSelected$() {
    return merge(this.appendButtonClicked$, this.replaceButtonClicked$).pipe(
      switchMap(() => this.optionSelected$$),
      map((optionSelected) => optionSelected === null)
    );
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

  get textRecords$() {
    return this.textRecords$$
      .asObservable()
      .pipe(filter((textRecordsFromJson) => textRecordsFromJson !== null));
  }

  get outputTexts$() {
    return this.textRecords$$.pipe(
      map((textRecords) =>
        textRecords
          ?.filter((textRecord) => !!textRecord.isDisplayed)
          ?.map((textRecord) => textRecord.value)
          .sort(sortingStringsMethod)
      )
    );
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

  setIsAuthorNameDisplayedTrue(): void {
    this.isPersonalDataDisplayed$$.next(true);
  }

  resetSettingsToDefault(): void {
    this.isPersonalDataDisplayed$$.next(false);
    this.resetTextRecordsToDefault();
    this.resetRadioButtons$$.next();
  }

  setDialogReference(dialog: HTMLDialogElement): void {
    this.htmlDialogElement = dialog;
  }

  private resetTextRecordsToDefault(): void {
    let textRecords = this.textRecords$$?.value?.map((textRecord) => {
      if (textRecord.value === loremIpsumText) {
        return { ...textRecord, isDisplayed: true };
      }

      return { ...textRecord, isDisplayed: false };
    });

    if (textRecords) {
      this.textRecords$$.next(textRecords);
    }
  }

  private setupAppendTextStream$() {
    return this.appendButtonClicked$.pipe(
      switchMap(() =>
        forkJoin([
          this.optionSelected$.pipe(first()),
          this.textRecords$.pipe(first()),
        ])
      ),
      tap(([optionSelected, textRecordsFromJson]) => {
        if (textRecordsFromJson) {
          this.emitAppendedOutputText(optionSelected, textRecordsFromJson);
        }
      })
    );
  }

  private setupReplaceTextStream$() {
    return this.replaceButtonClicked$.pipe(
      switchMap(() =>
        forkJoin([
          this.optionSelected$.pipe(first()),
          this.textRecords$.pipe(first()),
        ])
      ),
      tap(([optionSelected, textRecordsFromJson]) => {
        if (textRecordsFromJson) {
          this.emitReplacementOutputText(optionSelected, textRecordsFromJson);
        }
      })
    );
  }

  private emitAppendedOutputText(
    optionSelected: Option,
    textRecordsFromJson: TextRecord[]
  ): void {
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
        const textRecordsFromJsonCopyWithoutLoremIpsum = [
          ...textRecordsFromJson,
        ];
        textRecordsFromJsonCopyWithoutLoremIpsum.pop();

        const areThereAnyNotDisplayedValues =
          textRecordsFromJsonCopyWithoutLoremIpsum.find(
            (textRecord) => textRecord.isDisplayed === false
          );

        if (!areThereAnyNotDisplayedValues) {
          break;
        }

        while (!textToAppend) {
          const randomIndex = generateRandomIndexOfArrayIndexes(
            textRecordsFromJsonCopyWithoutLoremIpsum.length
          );

          textToAppend = this.getTextFromJsonToAppendAndSetItsFlag(
            textRecordsFromJson,
            randomIndex
          );
        }
        break;

      default:
        throw Error('invalid option');
    }

    this.saveTextRecordsToLocalStorage();

    if (textToAppend === null) {
      this.htmlDialogElement?.showModal();
    }
  }

  private emitReplacementOutputText(
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
          const randomIndex = generateRandomIndexOfArrayIndexes(
            textRecordsFromJson.length
          );

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

    this.saveTextRecordsToLocalStorage();
  }

  private getTextFromJsonToAppendAndSetItsFlag(
    textRecordsFromJson: TextRecord[],
    index: number
  ): string | null {
    let text: string | null = null;

    if (!textRecordsFromJson[index].isDisplayed) {
      text = textRecordsFromJson[index].value;

      textRecordsFromJson[index].isDisplayed = true;
      this.textRecords$$.next(textRecordsFromJson);
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

    this.textRecords$$.next(textRecordsFromJson);

    return text;
  }

  private emitTextRecordsFromStorageOrFile(): void {
    const textRecordsFromStorage = this.getTextRecordsFromLocalStorage();

    if (textRecordsFromStorage) {
      this.textRecords$$.next(textRecordsFromStorage);
    } else {
      this.getTextRecordsFromJsonFile()
        .pipe(
          tap((textRecords) => this.textRecords$$.next(textRecords)),
          takeUntilDestroyed()
        )
        .subscribe();
    }
  }

  private getTextRecordsFromLocalStorage() {
    const textRecordsAsString = localStorage.getItem(
      this.TEXT_RECORDS_STORAGE_KEY
    );

    if (textRecordsAsString) {
      let textRecords = JSON.parse(textRecordsAsString) as TextRecord[];

      return isTextRecordArray(textRecords) ? textRecords : null;
    }

    return null;
  }

  private getTextRecordsFromJsonFile() {
    return this.http
      .get<Record<string, TextRecord[]>>('./../../../assets/data.json')
      .pipe(map((data) => data['data']));
  }

  private saveTextRecordsToLocalStorage() {
    const textRecordsFromJson = this.textRecords$$.value;

    if (textRecordsFromJson) {
      localStorage.setItem(
        this.TEXT_RECORDS_STORAGE_KEY,
        JSON.stringify(textRecordsFromJson)
      );
    }
  }
}
