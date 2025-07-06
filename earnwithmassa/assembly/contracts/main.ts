// The entry file of your WebAssembly module.
import { Context, generateEvent, Storage } from '@massalabs/massa-as-sdk';
import { Args, stringToBytes, bytesToString } from '@massalabs/as-types';

const TASK_COUNTER_KEY = 'task_counter';

class Submission {
  user: string;
  submissionLink: string;
  constructor() {
    this.user = "";
    this.submissionLink = "";
  }
}

class Task {
  creator: string;
  tokenGate: string;
  rewardToken: string;
  rewardAmount: u64;
  details: string;
  submissions: Array<Submission>;
  isClosed: bool;
  winner: string;
  constructor() {
    this.creator = "";
    this.tokenGate = "";
    this.rewardToken = "";
    this.rewardAmount = 0;
    this.details = "";
    this.submissions = new Array<Submission>();
    this.isClosed = false;
    this.winner = "";
  }
}

function getTaskKey(taskId: u32): string {
  return `task_${taskId}`;
}

function getSubmissionKey(taskId: u32, user: string): string {
  return `submission_${taskId}_${user}`;
}

// Utility: serialize/deserialize Task and Submission using Args and StaticArray<u8>
function serializeTask(task: Task): StaticArray<u8> {
  const args = new Args();
  args.add(task.creator)
      .add(task.tokenGate)
      .add(task.rewardToken)
      .add<u64>(task.rewardAmount)
      .add(task.details)
      .add<u32>(task.submissions.length);
  for (let i = 0; i < task.submissions.length; i++) {
    args.add(task.submissions[i].user).add(task.submissions[i].submissionLink);
  }
  args.add(task.isClosed ? 1 : 0)
      .add(task.winner);
  return args.serialize();
}

function deserializeTask(data: StaticArray<u8>): Task {
  const args = new Args(data);
  const task = new Task();
  task.creator = args.nextString().expect('creator');
  task.tokenGate = args.nextString().expect('tokenGate');
  task.rewardToken = args.nextString().expect('rewardToken');
  task.rewardAmount = args.nextU64().expect('rewardAmount');
  task.details = args.nextString().expect('details');
  const subLen = args.nextU32().expect('subLen');
  for (let i: u32 = 0; i < subLen; i++) {
    const sub = new Submission();
    sub.user = args.nextString().expect('sub.user');
    sub.submissionLink = args.nextString().expect('sub.link');
    task.submissions.push(sub);
  }
  task.isClosed = args.nextU32().expect('isClosed') == 1;
  task.winner = args.nextString().expect('winner');
  return task;
}

function serializeSubmissions(subs: Array<Submission>): StaticArray<u8> {
  const args = new Args();
  args.add<u32>(subs.length);
  for (let i = 0; i < subs.length; i++) {
    args.add(subs[i].user).add(subs[i].submissionLink);
  }
  return args.serialize();
}

function deserializeSubmissions(data: StaticArray<u8>): Array<Submission> {
  const args = new Args(data);
  const len = args.nextU32().expect('len');
  const arr = new Array<Submission>();
  for (let i: u32 = 0; i < len; i++) {
    const sub = new Submission();
    sub.user = args.nextString().expect('user');
    sub.submissionLink = args.nextString().expect('link');
    arr.push(sub);
  }
  return arr;
}

// Update contract functions to use serialization
export function createTask(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const tokenGate = args.nextString().expect('Token gate required');
  const rewardToken = args.nextString().expect('Reward token required');
  const rewardAmount = args.nextU64().expect('Reward amount required');
  const details = args.nextString().expect('Details required');

  let taskCounter = Storage.has(TASK_COUNTER_KEY) ? U32.parseInt(Storage.get(TASK_COUNTER_KEY)) : 0;
  const creator = Context.caller();

  const task = new Task();
  task.creator = creator.toString();
  task.tokenGate = tokenGate;
  task.rewardToken = rewardToken;
  task.rewardAmount = rewardAmount;
  task.details = details;
  task.submissions = new Array<Submission>();
  task.isClosed = false;
  task.winner = "";

  Storage.set(getTaskKey(taskCounter), bytesToString(serializeTask(task)));
  Storage.set(TASK_COUNTER_KEY, (taskCounter + 1).toString());

  generateEvent(`TaskCreated:${taskCounter}:${task.creator}`);
}

export function getTask(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const taskId = args.nextU32().expect('Task ID required');
  assert(Storage.has(getTaskKey(taskId)), 'Task not found');
  const task = deserializeTask(stringToBytes(Storage.get(getTaskKey(taskId))));
  return serializeTask(task);
}

export function submitToTask(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const taskId = args.nextU32().expect('Task ID required');
  const submissionLink = args.nextString().expect('Submission link required');
  const user = Context.caller();

  assert(Storage.has(getTaskKey(taskId)), 'Task not found');
  let task = deserializeTask(stringToBytes(Storage.get(getTaskKey(taskId))));
  assert(!task.isClosed, 'Task is closed');
  assert(task.submissions.length < 3, 'Max submissions reached');
  assert(!Storage.has(getSubmissionKey(taskId, user.toString())), 'Already submitted');

  const submission = new Submission();
  submission.user = user.toString();
  submission.submissionLink = submissionLink;
  task.submissions.push(submission);

  Storage.set(getSubmissionKey(taskId, user.toString()), submissionLink); // Only store link for quick check
  Storage.set(getTaskKey(taskId), bytesToString(serializeTask(task)));

  generateEvent(`Submitted:${taskId}:${user.toString()}:${submissionLink}`);

  if (task.submissions.length >= 3) {
    task.isClosed = true;
    Storage.set(getTaskKey(taskId), bytesToString(serializeTask(task)));
  }
}

export function pickWinner(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const taskId = args.nextU32().expect('Task ID required');
  const winner = args.nextString().expect('Winner address required');
  assert(Storage.has(getTaskKey(taskId)), 'Task not found');
  let task = deserializeTask(stringToBytes(Storage.get(getTaskKey(taskId))));
  assert(Context.caller().toString() == task.creator, 'Only creator can pick winner');
  assert(!task.isClosed, 'Task already closed');
  let found = false;
  for (let i = 0; i < task.submissions.length; i++) {
    if (task.submissions[i].user == winner) {
      found = true;
      break;
    }
  }
  assert(found, 'Winner must be a submitter');

  task.isClosed = true;
  task.winner = winner;
  Storage.set(getTaskKey(taskId), bytesToString(serializeTask(task)));

  generateEvent(`WinnerPicked:${taskId}:${winner}`);
}

export function hasSubmitted(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const taskId = args.nextU32().expect('Task ID required');
  const user = args.nextString().expect('User address required');
  return stringToBytes(Storage.has(getSubmissionKey(taskId, user)) ? 'true' : 'false');
}

export function taskCounter(_: StaticArray<u8>): StaticArray<u8> {
  return stringToBytes(Storage.has(TASK_COUNTER_KEY) ? Storage.get(TASK_COUNTER_KEY) : '0');
}

export function getSubmissions(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const taskId = args.nextU32().expect('Task ID required');
  assert(Storage.has(getTaskKey(taskId)), 'Task not found');
  const task = deserializeTask(stringToBytes(Storage.get(getTaskKey(taskId))));
  return serializeSubmissions(task.submissions);
}
