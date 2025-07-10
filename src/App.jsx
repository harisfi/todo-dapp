import { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "../hardhat-todo/artifacts/contracts/ToDo.sol/ToDo.json";

function App() {
  const [tasks, setTasks] = useState([]);
  const [taskText, setTaskText] = useState("");
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingCompleteTodoId, setLoadingCompleteTodoId] = useState(-1);
  const [loadingTasks, setLoadingTasks] = useState(false);

  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      setAccount(userAddress);

      const contract = new ethers.Contract(contractAddress, abi.abi, signer);
      setContract(contract);

      fetchTasks(contract);
    } else {
      alert("Please install MetaMask");
    }
  };

  const fetchTasks = async (_contract) => {
    if (_contract !== null) {
      setLoadingTasks(true);
      const taskList = await _contract.getTasks();
      const mapped = taskList.map((t) => ({
        id: t.id,
        description: t.description,
        completed: t.completed,
      }));
      mapped
        .sort((a, b) => b.id > a.id)
        .sort((a, b) => {
          if (a.completed === false && b.completed === true) {
            return -1; // 'a' (false) comes before 'b' (true)
          } else if (a.completed === true && b.completed === false) {
            return 1; // 'b' (false) comes before 'a' (true)
          } else {
            return 0; // Maintain relative order if values are equal
          }
        });
      setTasks(mapped);
      setLoadingTasks(false);
    }
  };

  const addTask = async () => {
    if (!taskText || !contract) return;
    try {
      setLoadingCreate(true);
      const tx = await contract.addTask(taskText);
      await tx.wait();
      fetchTasks(contract);
      setTaskText("");
    } catch (err) {
      console.error(err);
      alert("Action failed!");
    } finally {
      document.getElementById("add_task_modal").close();
      setLoadingCreate(false);
    }
  };

  const completeTask = async (id) => {
    try {
      setLoadingCompleteTodoId(id);
      const tx = await contract.completeTask(id);
      await tx.wait();
      fetchTasks(contract);
    } catch (err) {
      console.error(err);
      alert("Action failed!");
    } finally {
      setLoadingCompleteTodoId(-1);
    }
  };

  useEffect(() => {
    connectWallet();
    fetchTasks(contract);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const completedCount = tasks.filter((todo) => todo.completed).length;
  const totalCount = tasks.length;

  function smartTrim(string, maxLength) {
    if (!string) return string;
    if (maxLength < 1) return string;
    if (string.length <= maxLength) return string;
    if (maxLength == 1) return string.substring(0, 1) + "...";

    var midpoint = Math.ceil(string.length / 2);
    var toremove = string.length - maxLength;
    var lstrip = Math.ceil(toremove / 2);
    var rstrip = toremove - lstrip;
    return (
      string.substring(0, midpoint - lstrip) +
      "..." +
      string.substring(midpoint + rstrip)
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-4">
      <div className="max-w-md mx-auto sm:max-w-lg md:max-w-2xl lg:max-w-4xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Web3 To-Do List App
          </h1>
          <p className="text-base-content/70">Stay organized and productive</p>
        </div>

        {account ? (
          <>
            <div className="float-end mb-2">
              <div className="inline-grid *:[grid-area:1/1]">
                <div className="status status-info animate-ping"></div>
                <div className="status status-info"></div>
              </div>{" "}
              Connected: <code title={account}>{smartTrim(account, 12)}</code>
              <div
                class="tooltip tooltip-left tooltip-accent m-2 self-start [justify-self:right]"
                data-tip="copy"
              >
                <button
                  class="btn btn-square btn-sm"
                  aria-label="Copy to clipboard"
                  onClick={() => {
                    navigator.clipboard
                      .writeText(account)
                      .then(() => {
                        console.log("Text successfully copied to clipboard!");
                      })
                      .catch((err) => {
                        console.error("Failed to copy text: ", err);
                      });
                  }}
                >
                  <svg
                    class="h-5 w-5 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 32 32"
                  >
                    <path d="M 16 3 C 14.742188 3 13.847656 3.890625 13.40625 5 L 6 5 L 6 28 L 26 28 L 26 5 L 18.59375 5 C 18.152344 3.890625 17.257813 3 16 3 Z M 16 5 C 16.554688 5 17 5.445313 17 6 L 17 7 L 20 7 L 20 9 L 12 9 L 12 7 L 15 7 L 15 6 C 15 5.445313 15.445313 5 16 5 Z M 8 7 L 10 7 L 10 11 L 22 11 L 22 7 L 24 7 L 24 26 L 8 26 Z"></path>
                  </svg>
                </button>
              </div>
            </div>

            <div className="stats bg-white shadow mb-6 w-full">
              <div className="stat">
                <div className="stat-figure text-secondary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="inline-block w-8 h-8 stroke-current"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
                <div className="stat-title">Total Tasks</div>
                <div className="stat-value text-secondary">{totalCount}</div>
                <div className="stat-desc">Keep it up!</div>
              </div>

              <div className="stat">
                <div className="stat-figure text-info">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="inline-block w-8 h-8 stroke-current"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
                <div className="stat-title">Completed</div>
                <div className="stat-value text-info">{completedCount}</div>
                <div className="stat-desc">
                  {totalCount > 0
                    ? Math.round((completedCount / totalCount) * 100)
                    : 0}
                  % done
                </div>
              </div>
            </div>

            <div className="text-center mb-6">
              <button
                className="btn btn-neutral btn-lg w-full sm:w-auto"
                onClick={() =>
                  document.getElementById("add_task_modal").showModal()
                }
                disabled={loadingTasks || loadingCompleteTodoId != -1}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Add New Task
              </button>
            </div>

            <dialog id="add_task_modal" className="modal">
              <div className="modal-box">
                <h3 className="font-bold text-lg mb-4">Add New Task</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="What needs to be done?"
                    className="input input-bordered w-full"
                    value={taskText}
                    onChange={(e) => setTaskText(e.target.value)}
                    disabled={loadingCreate}
                  />
                  <div className="modal-action">
                    <button
                      className="btn btn-info"
                      onClick={addTask}
                      disabled={!taskText.trim() || loadingCreate}
                    >
                      Add Task{" "}
                      {loadingCreate && (
                        <span className="loading loading-spinner loading-xs" />
                      )}
                    </button>
                    <form method="dialog">
                      <button className="btn" disabled={loadingCreate}>
                        Cancel
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </dialog>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body p-4 sm:p-6">
                <h2 className="card-title text-lg sm:text-xl mb-4">
                  Your Tasks
                  {totalCount > 0 && (
                    <div className="badge badge-secondary">{totalCount}</div>
                  )}
                </h2>

                {loadingTasks ? (
                  <div className="text-center py-8 text-base-content/60">
                    <span className="loading loading-spinner loading-xl" />
                    <p className="text-lg font-medium">Loading tasks...</p>
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="text-center py-8 text-base-content/60">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 mx-auto mb-4 opacity-50"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-lg font-medium">No tasks yet!</p>
                    <p className="text-sm">
                      Add your first task above to get started.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tasks.map((todo) => (
                      <div
                        key={todo.id}
                        className={`flex items-center gap-3 p-3 sm:p-4 rounded-lg border transition-all duration-200 ${
                          todo.completed
                            ? "bg-success/10 border-success/20"
                            : "bg-base-200 border-base-300 hover:border-neutral/30"
                        }`}
                      >
                        {loadingCompleteTodoId == todo.id ? (
                          <span className="loading loading-spinner loading-xs" />
                        ) : (
                          <input
                            type="checkbox"
                            className={`checkbox checkbox-neutral ${
                              todo.completed ? "cursor-default" : ""
                            }`}
                            checked={todo.completed}
                            onChange={() => {
                              if (!todo.completed) {
                                completeTask(todo.id);
                              }
                            }}
                            disabled={
                              !todo.completed && loadingCompleteTodoId != -1
                            }
                          />
                        )}

                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm sm:text-base break-words ${
                              todo.completed
                                ? "line-through text-base-content/60"
                                : "text-base-content"
                            }`}
                          >
                            {todo.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-base-content/60">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto mb-4 opacity-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-lg font-medium">No tasks yet!</p>
            <p className="text-sm">Connect to your wallet to get started.</p>
            <button className="btn btn-info mt-10" onClick={connectWallet}>
              Connect Wallet
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
