import "./App.css";
import { useEffect, useMemo, useState, startTransition } from "react";
import { flushSync } from "react-dom";

function HeavyList({ size, seed }) {
  const list = useMemo(() => {
    const arr = new Array(size).fill(0).map((_, i) => i + seed);
    let acc = 0;
    for (let i = 0; i < arr.length; i++) {
      acc ^= (arr[i] * 2654435761) >>> 0;
    }
    return { arr, acc };
  }, [size, seed]);
  return (
    <div
      style={{
        maxHeight: 240,
        overflow: "auto",
        border: "1px solid #ddd",
        marginTop: 8,
      }}
    >
      {list.arr.slice(0, 200).map((n) => (
        <div key={n} style={{ fontSize: 12, padding: "2px 6px" }}>
          {n}
        </div>
      ))}
    </div>
  );
}

function DebugPanel() {
  const [count, setCount] = useState(0);
  const [moveCount, setMoveCount] = useState(0);
  const [listSize, setListSize] = useState(0);
  const [seed, setSeed] = useState(0);
  const [effectToggle, setEffectToggle] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    setCount((c) => c + 1);
    setLogs((l) => [...l, `effect-run@${Date.now()}`]);
  }, [effectToggle]);

  function log(msg) {
    setLogs((l) => [...l, `${msg}@${Date.now()}`]);
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>React 源码调试面板</h2>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button
          onClick={() => {
            setCount((c) => c + 1);
            log("default-update");
          }}
        >
          默认更新 +1
        </button>
        <button
          onClick={() => {
            setCount(2000);
            flushSync(() => setCount((c) => c + 1));
            setCount((c) => c + 2);
            setCount((c) => c + 2);
            setCount((c) => c + 2);
          }}
        >
          flushSync +1
        </button>
        <button
          onClick={() => {
            startTransition(() => setCount((c) => c + 1));
            log("transition-update");
          }}
        >
          startTransition +1
        </button>
        <button
          onClick={() => {
            startTransition(() => {
              setListSize(5000);
              setSeed((s) => s + 1);
            });
            log("transition-heavy-list");
          }}
        >
          过渡更新大列表
        </button>
        <button
          onClick={() => {
            setEffectToggle((t) => !t);
            log("toggle-effect");
          }}
        >
          触发被动副作用
        </button>
      </div>

      <div style={{ marginTop: 12 }}>计数：{count}</div>

      <div
        style={{ marginTop: 12, padding: 12, border: "1px dashed #ccc" }}
        onMouseMove={() => {
          setMoveCount((m) => m + 1);
          setMoveCount((m) => m + 1);
        }}
      >
        连续事件区域（mousemove）：{moveCount}
      </div>

      {listSize > 0 && (
        <div style={{ marginTop: 12 }}>
          <div>大列表（并发渲染观察）：{listSize}</div>
          <HeavyList size={listSize} seed={seed} />
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <div>日志：</div>
        <div
          style={{
            maxHeight: 140,
            overflow: "auto",
            fontSize: 12,
            border: "1px solid #eee",
            padding: 8,
          }}
        >
          {logs.slice(-50).map((m, i) => (
            <div key={i}>{m}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="App">
      <DebugPanel />
    </div>
  );
}
