# Redux Learning Project

A simple React + Redux Toolkit project demonstrating core Redux concepts through a counter application with action history tracking.

## Project Structure

```
redux-learning/
├── public/
│   └── index.html
├── src/
│   ├── app/
│   │   ├── store.js          # Redux store configuration
│   │   └── hooks.js          # Typed Redux hooks
│   ├── features/
│   │   ├── counter/
│   │   │   ├── counterSlice.js  # Counter slice (state + reducers)
│   │   │   └── Counter.js       # Counter UI component
│   │   └── history/
│   │       ├── historySlice.js  # History slice (state + reducers)
│   │       └── History.js       # History UI component
│   ├── App.js                # Main app component
│   ├── App.css
│   ├── index.js              # Entry point
│   └── index.css
├── package.json
└── learn.md                  # This file
```

---

## How Redux Works in This Project

### 1. The Redux Store (`src/app/store.js`)

The store is the **single source of truth** for the entire application state.

```javascript
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import historyReducer from '../features/history/historySlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    history: historyReducer,
  },
});
```

**Key Points:**
- `configureStore` automatically sets up Redux DevTools, thunk middleware, and serialization checks
- The store holds a single state tree with multiple "slices" (here: `counter` and `history`)
- Each slice has its own reducer function

---

### 2. Slices - State + Reducers (`counterSlice.js`, `historySlice.js`)

Slices are the modern Redux Toolkit way to organize Redux logic. Each slice contains:
- **Initial state**
- **Reducer functions** (state update logic)
- **Action creators** (auto-generated)

#### Counter Slice (`src/features/counter/counterSlice.js`)

```javascript
import { createSlice } from '@reduxjs/toolkit';

const initialState = { value: 0 };

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => { state.value += 1; },
    decrement: (state) => { state.value -= 1; },
    incrementByAmount: (state, action) => { state.value += action.payload; },
    reset: (state) => { state.value = 0; },
  },
});

export const { increment, decrement, incrementByAmount, reset } = counterSlice.actions;
export default counterSlice.reducer;
```

**How it works:**
- `createSlice` uses **Immer** internally - you can write "mutating" syntax (`state.value += 1`) that gets converted to immutable updates
- Action creators (`increment`, `decrement`, etc.) are auto-generated from reducer names
- The `reducer` property is what gets registered in the store

#### History Slice (`src/features/history/historySlice.js`)

```javascript
const initialState = { actions: [] };

export const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    addAction: (state, action) => {
      state.actions.unshift({
        type: action.payload.type,
        value: action.payload.value,
        timestamp: new Date().toLocaleTimeString(),
      });
      if (state.actions.length > 20) state.actions.pop();
    },
    clearHistory: (state) => { state.actions = []; },
  },
});
```

---

### 3. Provider - Making Store Available (`src/index.js`)

```javascript
import { Provider } from 'react-redux';
import { store } from './app/store';

root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
```

The `<Provider>` component makes the Redux store available to all components in the tree via React Context.

---

### 4. Typed Hooks (`src/app/hooks.js`)

```javascript
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector.withTypes();
```

Provides TypeScript support (and better autocomplete) for:
- `useAppSelector` - Reading state
- `useAppDispatch` - Dispatching actions

---

### 5. Using Redux in Components

#### Reading State (`useAppSelector`)

```javascript
import { useAppSelector } from '../../app/hooks';

export function Counter() {
  const count = useAppSelector((state) => state.counter.value);
  // ...
}
```

**Selector Function:**
- Receives the entire RootState
- Returns the specific data the component needs
- Re-runs when the returned value changes (reference equality)

#### Dispatching Actions (`useAppDispatch`)

```javascript
import { useAppDispatch } from '../../app/hooks';
import { increment } from '../counter/counterSlice';
import { addAction } from '../history/historySlice';

export function Counter() {
  const dispatch = useAppDispatch();

  const handleIncrement = () => {
    dispatch(increment());                    // Updates counter state
    dispatch(addAction({ type: 'Increment', value: '+1' })); // Logs to history
  };
  // ...
}
```

**Dispatch:**
- Sends an action object to the store
- Store runs all reducers with the action
- Reducers that match the action type update their slice of state
- Connected components re-render with new state

---

## Redux Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERACTION                          │
│                  (Click "Increment" button)                     │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DISPATCH ACTION                           │
│               dispatch(increment())                              │
│               dispatch(addAction({...}))                         │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                          REDUX STORE                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    ROOT REDUCER                          │   │
│  │  ┌──────────────────┐         ┌──────────────────┐      │   │
│  │  │ counterReducer   │         │ historyReducer   │      │   │
│  │  │ (handles         │         │ (handles         │      │   │
│  │  │  increment)      │         │  addAction)      │      │   │
│  │  └────────┬─────────┘         └────────┬─────────┘      │   │
│  └───────────┼────────────────────────────┼──────────────────┘   │
│              │                            │                      │
│              ▼                            ▼                      │
│  ┌──────────────────┐         ┌──────────────────┐              │
│  │ NEW counter state│         │ NEW history state│              │
│  │ { value: 1 }     │         │ { actions: [...] }│             │
│  └──────────────────┘         └──────────────────┘              │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUBSCRIBED COMPONENTS                         │
│  ┌──────────────────┐         ┌──────────────────┐              │
│  │ Counter component│         │ History component│              │
│  │ useSelector runs │         │ useSelector runs │              │
│  │ gets new count   │         │ gets new actions │              │
│  │ Re-renders       │         │ Re-renders       │              │
│  └──────────────────┘         └──────────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Redux Concepts Demonstrated

| Concept | Implementation |
|---------|----------------|
| **Single Source of Truth** | One store with `counter` and `history` slices |
| **State is Read-Only** | Only reducers can modify state (via dispatch) |
| **Changes via Pure Functions** | Reducers are pure - same input = same output |
| **Action Objects** | `{ type: 'counter/increment' }` or with payload |
| **Immutability** | Handled automatically by Immer in `createSlice` |
| **Selectors** | `useAppSelector(state => state.counter.value)` |
| **Middleware** | Redux Thunk included by default (for async) |

---

## Running the Project

```bash
# Install dependencies
npm install

# Start development server
npm start
```

Open http://localhost:3000 to see the counter app.

---

## Learning Exercises

1. **Add Async Action**: Create a thunk that increments after a delay
   ```javascript
   // In counterSlice.js
   export const incrementAsync = createAsyncThunk(
     'counter/incrementAsync',
     async (amount) => {
       await new Promise(resolve => setTimeout(resolve, 1000));
       return amount;
     }
   );
   ```

2. **Add Persistence**: Save/load state from localStorage
   ```javascript
   // In store.js
   const preloadedState = loadFromLocalStorage();
   export const store = configureStore({
     reducer: { ... },
     preloadedState,
   });
   store.subscribe(() => saveToLocalStorage(store.getState()));
   ```

3. **Add Logger Middleware**: Log all actions and state changes
   ```javascript
   // In store.js
   const logger = (store) => (next) => (action) => {
     console.log('dispatching', action);
     const result = next(action);
     console.log('next state', store.getState());
     return result;
   };
   ```

4. **Create a Feature Toggle**: Add a slice to enable/disable features

---

## Redux Toolkit vs Traditional Redux

| Aspect | Traditional Redux | Redux Toolkit (This Project) |
|--------|-------------------|------------------------------|
| Boilerplate | High (action types, creators, switch) | Low (`createSlice` auto-generates) |
| Immutability | Manual (`{...state, value: state.value+1}`) | Automatic (Immer) |
| DevTools | Manual setup | Built-in |
| TypeScript | Verbose types | Excellent inference |
| Best Practices | Manual enforcement | Enforced by default |

---

## File Reference Quick Guide

| File | Purpose |
|------|---------|
| `src/app/store.js` | Configures store, combines reducers |
| `src/app/hooks.js` | Typed `useDispatch`/`useSelector` |
| `src/features/counter/counterSlice.js` | Counter state + reducers + actions |
| `src/features/counter/Counter.js` | Counter UI, dispatches actions |
| `src/features/history/historySlice.js` | History state + reducers + actions |
| `src/features/history/History.js` | History UI, displays action log |
| `src/App.js` | Composes Counter + History |
| `src/index.js` | Entry point, wraps with Provider |

---

## Next Steps for Learning

1. **RTK Query** - For data fetching/caching (replaces thunks for API calls)
2. **Redux DevTools** - Install browser extension to debug state changes
3. **TypeScript** - Add `.tsx` files for full type safety
4. **Testing** - Test reducers in isolation, test components with mocked store
5. **Middleware** - Custom middleware for logging, analytics, persistence

---

This project demonstrates the **modern, recommended way** to use Redux with Redux Toolkit. The patterns here scale to large applications while keeping boilerplate minimal.

---

## Application Flow — How Redux Works in This App

A concrete, step-by-step walkthrough of what happens from page load to a button click, using the actual code in this repository.

### Phase 1: Startup

1. **`src/index.js`** imports `store` from `src/app/store.js`. `configureStore` combines the two slice reducers into one root reducer:

   ```javascript
   reducer: {
     counter: counterReducer,   // manages state.counter
     history: historyReducer,   // manages state.history
   }
   ```

2. **`<Provider store={store}>`** publishes the store through React Context, so any component in the tree can reach it.
3. **`App`** renders `<Counter />` and `<History />`.
4. Each component runs its `useAppSelector` immediately, reading the initial state:

   ```javascript
   const count   = useAppSelector((state) => state.counter.value);   // Counter.js
   const actions = useAppSelector((state) => state.history.actions); // History.js
   ```

**State tree at load time:**

```javascript
{
  counter: { value: 0 },
  history: { actions: [] }
}
```

---

### Phase 2: User clicks "Increment (+1)"

**Step 1 — The event handler runs** (`src/features/counter/Counter.js`):

```javascript
const handleIncrement = () => {
  dispatch(increment());                                      // action 1
  dispatch(addAction({ type: 'Increment', value: '+1' }));    // action 2
};
```

**Step 2 — Two separate actions are dispatched.** Each is a plain object created by the auto-generated action creators:

```javascript
{ type: 'counter/increment' }
{ type: 'history/addAction', payload: { type: 'Increment', value: '+1' } }
```

**Step 3 — The store runs the root reducer for each action.** Every slice reducer receives every action, but each only handles the types it cares about (Redux Toolkit matches on the slice `name` prefix):

| Action type | `counterReducer` | `historyReducer` | Effect |
|-------------|------------------|------------------|--------|
| `counter/increment` | ✅ handles it | ignores | `value: 0 → 1` |
| `history/addAction` | ignores | ✅ handles it | `unshift` new entry + timestamp, cap at 20 |

Immer lets the reducers use mutating syntax (`state.value += 1`), while producing a brand-new immutable state tree underneath.

**Step 4 — The store swaps in the new state and notifies subscribers:**

```javascript
{
  counter: { value: 1 },
  history: {
    actions: [
      { type: 'Increment', value: '+1', timestamp: '3:04:22 PM' }
    ]
  }
}
```

**Step 5 — react-redux re-runs each selector.** `Counter`'s selector now returns `1` instead of `0`, so it re-renders. `History`'s selector returns a new array reference, so it re-renders too. Components whose selector returns an unchanged value are skipped.

**Step 6 — The UI updates.** The counter display shows `1`; the history list shows the new entry (the `timestamp` was captured inside the `addAction` reducer with `new Date().toLocaleTimeString()`).

> Note: the two dispatches happen **synchronously in the same click handler**, but they are still two independent store updates, each triggering its own notification/re-render cycle.

---

### Full Sequence Diagram

```
 Counter.js                Store                counterReducer         historyReducer        Counter.js / History.js
 ─────────                ─────                ──────────────         ──────────────        ───────────────────────
   click "Increment (+1)"
        │
        ├── dispatch ────► run root reducer ──► state.value += 1
        │   increment()        │                                         (ignored)
        │                      │
        │◄── notify subscribers ◄── new state { counter.value: 1 }
        │                                                      
        ├── dispatch ────► run root reducer ──►  (ignored)  ──► unshift entry,
        │   addAction()       │                                               cap at 20
        │                      │
        │◄── notify subscribers ◄── new state { history.actions: [...] }
        │
        ▼                       ▼                      ▼                        ▼                    re-render
   (handler finishes)   state replaced        counter updated           history updated         with new values
```

---

### Every User Event → Dispatch Map

| UI Event | Dispatches | Where |
|----------|-----------|-------|
| Click **Increment (+1)** | `increment()` + `addAction({ type: 'Increment', value: '+1' })` | `Counter.js` |
| Click **Decrement (-1)** | `decrement()` + `addAction({ type: 'Decrement', value: '-1' })` | `Counter.js` |
| Click **Increment by Amount** | `incrementByAmount(amount)` + `addAction({ type: 'Increment By', value: '+N' })` — only if `amount !== 0`; also clears the input | `Counter.js` |
| Click **Reset** | `reset()` + `addAction({ type: 'Reset', value: '0' })` | `Counter.js` |
| Click **Clear History** | `clearHistory()` — only rendered when `actions.length > 0` | `History.js` |

Each counter action is always paired with a history action, so the log stays in sync with the state changes — this is **one-way data flow**: UI → dispatch → reducer → new state → UI.

---

### What Lives Where

| Data | Location | Why |
|------|----------|-----|
| `counter.value` | **Redux store** (`state.counter`) | Shared, app-level state that must survive re-renders and feed the history log |
| `history.actions` | **Redux store** (`state.history`) | Read by `History`, written in response to actions dispatched from `Counter` |
| Input field text | **Local `useState`** in `Counter` | Ephemeral UI state — no other component needs it |
| "Clear History" button visible? | **Derived** from `actions.length > 0` | Computed during render, never stored |
| Timestamps | **Created in the reducer** | Generated once when the action is applied, so it matches the actual state-change time |

**Rule of thumb demonstrated here:** keep only state that multiple components need or that changes in response to Redux actions; everything else stays local to the component.