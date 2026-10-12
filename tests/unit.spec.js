// Pure-function tests (run in Node): gender agreement, placeholders, list parsing.
import { test, expect } from '@playwright/test';
import { toGender, fillTokens, rankText } from '../src/schema/gender.js';
import { parseNames } from '../src/schema/parse.js';

test('gender: masculine → feminine and back', () => {
  const m = 'تتقدّم إدارة المدرسة بخالص الشكر والتقدير إلى الطالب';
  const r = 'وذلك لتفوّقه الدراسي وتميّزه في مادة الرياضيات، متمنّين له دوام التوفيق والنجاح.';
  expect(toGender(m, 'f')).toBe('تتقدّم إدارة المدرسة بخالص الشكر والتقدير إلى الطالبة');
  expect(toGender(r, 'f')).toBe('وذلك لتفوّقها الدراسي وتميّزها في مادة الرياضيات، متمنّين لها دوام التوفيق والنجاح.');
  expect(toGender(toGender(r, 'f'), 'm')).toBe(r);
  expect(toGender(toGender(m, 'f'), 'm')).toBe(m);
});

test('gender: whole words only, with or without diacritics', () => {
  expect(toGender('عبدالله بن سالم', 'f')).toBe('عبدالله بن سالم');           // «له» inside a name
  expect(toGender('الطلبة والطالبات', 'f')).toBe('الطلبة والطالبات');
  expect(toGender('لتفوقه الدراسي', 'f')).toBe('لتفوّقها الدراسي');          // no shadda in the input
  expect(toGender('للطالب المجتهد', 'f')).toBe('للطالبة المجتهد');            // adjectives are left alone
  expect(toGender('المتفوّقون في الرياضيات', 'f')).toBe('المتفوّقات في الرياضيات');
});

test('placeholders and ranks', () => {
  const rec = {name:'سالم', cls:'6/2', subject:'الرياضيات', rank:'1'};
  expect(fillTokens('لحصوله على {المركز} في مسابقة {المادة}', rec)).toBe('لحصوله على المركز الأول في مسابقة الرياضيات');
  expect(fillTokens('لحصوله على {المركز} في مسابقة {المادة}', {name:'سالم'})).toBe('لحصوله على مركز متقدّم في مسابقة المدرسة');
  expect(rankText('٢')).toBe('المركز الثاني');
  expect(rankText('الثالث')).toBe('المركز الثالث');
  expect(rankText('المركز الأول')).toBe('المركز الأول');
});

test('name lists: v1 lines, extra columns, Excel tabs', () => {
  expect(parseNames('سالم بن محمد - 6/1')).toEqual([{name:'سالم بن محمد', cls:'6/1'}]);
  expect(parseNames('سالم بن محمد')).toEqual([{name:'سالم بن محمد', cls:''}]);
  expect(parseNames('سالم - 6/1 - الرياضيات - 1')).toEqual([{name:'سالم', cls:'6/1', subject:'الرياضيات', rank:'1'}]);
  expect(parseNames('سالم\t6/1\tالعلوم\tالثاني')).toEqual([{name:'سالم', cls:'6/1', subject:'العلوم', rank:'الثاني'}]);
  expect(parseNames('\n\n  \nخالد - 5/2\n')).toEqual([{name:'خالد', cls:'5/2'}]);
});
