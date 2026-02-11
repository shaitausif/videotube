"use client";
import {
  ArrowDownTrayIcon,
  EllipsisVerticalIcon,
  MagnifyingGlassPlusIcon,
  PaperClipIcon,
  TrashIcon,
  XMarkIcon,
  ClipboardDocumentIcon,
  CheckIcon,
} from "@heroicons/react/20/solid";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import moment from "moment";
import { useState, useCallback } from "react";
import { ChatMessageInterface } from "@/interfaces/chat";
import { classNames } from "@/utils";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
const MessageItem: React.FC<{
  isAIMessage?: boolean;
  isOwnMessage?: boolean;
  isGroupChatMessage?: boolean;
  message: ChatMessageInterface;
  deleteChatMessage: (message: ChatMessageInterface) => void;
}> = ({
  message,
  isOwnMessage,
  isGroupChatMessage,
  deleteChatMessage,
  isAIMessage,
}) => {
  const [resizedImage, setResizedImage] = useState<string | null>(null);
  const [openOptions, setopenOptions] = useState<boolean>(false); //To open delete menu option on hover
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = useCallback((code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }, []);

  return (
    <>
      {resizedImage ? (
        <div className="h-full z-40 p-8 overflow-hidden w-full absolute inset-0 bg-black/70 flex justify-center items-center">
          <XMarkIcon
            className="absolute top-5 right-5 w-9 h-9 text-white cursor-pointer"
            onClick={() => setResizedImage(null)}
          />
          <img
            className="w-full h-full object-contain"
            src={resizedImage}
            alt="chat image"
          />
        </div>
      ) : null}
      <div
        className={classNames(
          "flex justify-start items-end gap-2 md:gap-3 max-w-lg min-w-",
          isOwnMessage ? "ml-auto" : ""
        )}
      >
        <Image
          src={message.sender?.avatar!}
          alt="Profile Image"
          height={20}
          width={20}
          className={classNames(
            "h-7 w-7 object-cover rounded-full flex flex-shrink-0",
            isOwnMessage ? "order-2" : "order-1"
          )}
        />
        {/* message box have to add the icon onhover here */}
        <div
          onMouseLeave={() =>
            setTimeout(() => {
              setopenOptions(false);
            }, 1000)
          }
          className={classNames(
            " p-4 rounded-3xl flex flex-col cursor-pointer group hover:bg-secondary",
            isOwnMessage
              ? "order-1 rounded-br-none dark:hover:text-white hover:text-black text-white  bg-purple-700"
              : "order-2 rounded-bl-none  bg-secondary"
          )}
        >
          {isGroupChatMessage && !isOwnMessage ? (
            <p
              className={classNames(
                "text-xs font-semibold mb-2",
                ["text-success", "text-danger"][
                  message.sender.username.length % 2
                ]
              )}
            >
              {message.sender?.username}
            </p>
          ) : null}
          {message?.attachments?.length > 0 ? (
            <div>
              {/*The option to delete message will only open in case of own messages*/}
              {isOwnMessage ? (
                <button
                  className="self-center p-1 relative options-button"
                  onClick={() => setopenOptions(!openOptions)}
                >
                  <EllipsisVerticalIcon className="group-hover:w-6 group-hover:opacity-100 w-0 opacity-0 transition-all ease-in-out duration-100 dark:text-zinc-300" />
                  <div
                    className={classNames(
                      "z-30 text-left absolute botom-0 translate-y-1 text-[10px] w-auto bg-dark rounded-2xl p-2 shadow-md border-[1px] border-secondary",
                      openOptions ? "block" : "hidden"
                    )}
                  >
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                    <p
                      
                      role="button"
                      className="border border-red-500 p-4 text-danger rounded-lg w-auto inline-flex items-center hover:bg-secondary"
                    >
                      <TrashIcon className="h-4 w-4 mr-2" />
                      Delete Message
                    </p>
                    </AlertDialogTrigger>
                     <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete your account and remove your data from our
                            servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              deleteChatMessage(message);
                            }}
                          >
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    
                    </AlertDialog>
                  </div>
                </button>
              ) : null}

              <div
                className={classNames(
                  "grid max-w-7xl gap-2",
                  message.attachments?.length === 1 ? " grid-cols-1" : "",
                  message.attachments?.length === 2 ? " grid-cols-2" : "",
                  message.attachments?.length >= 3 ? " grid-cols-3" : "",
                  message.content ? "mb-6" : ""
                )}
              >
                {message.attachments?.map((file) => {
                  return (
                    <div
                      key={file._id}
                      className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer"
                    >
                      <button
                        onClick={() => setResizedImage(file.url)}
                        className="absolute inset-0 z-20 flex justify-center items-center w-full gap-2 h-full bg-black/60 group-hover:opacity-100 opacity-0 transition-opacity ease-in-out duration-150"
                      >
                        <MagnifyingGlassPlusIcon className="h-6 w-6 text-white" />
                        <a
                          href={file.url}
                          download={file.url}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ArrowDownTrayIcon
                            title="download"
                            
                            className="hover:text-zinc-400 h-6 w-6 text-white cursor-pointer"
                          />
                        </a>
                      </button>
                      <img
                        className="h-full w-full object-cover"
                        src={file.url}
                        alt="msg_img"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
          {message.content ? (
            <div
              className={`relative flex ${isAIMessage ? "flex-row-reverse" : ""} justify-between`}
            >
              {/*The option to delete message will only open in case of own messages*/}
              {isOwnMessage || isAIMessage ? (
                <button
                  className={`${isAIMessage ? "self-baseline" : "self-center"} relative options-button`}
                  onClick={() => setopenOptions(!openOptions)}
                >
                  <EllipsisVerticalIcon className="group-hover:w-4 group-hover:opacity-100 w-0 opacity-0 transition-all ease-in-out duration-100 dark:text-zinc-300" />
                  <div
                    className={classNames(
                      "delete-menu z-20 text-left  absolute botom-0  text-[10px] w-auto bg-dark rounded-2xl  shadow-md border-[1px] border-secondary",
                      isAIMessage
                        ? "-translate-y-10 translate-x-10"
                        : "-translate-x-24 -translate-y-4",
                      openOptions ? "block" : "hidden"
                    )}
                  >
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <p
                        
                        role="button"
                        className=" p-2 text-danger rounded-lg w-auto inline-flex items-center hover:bg-secondary"
                      >
                        <TrashIcon className="h-4 w-auto mr-1" />
                        Delete Message
                      </p>
                      </AlertDialogTrigger>

                      
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete your account and remove your data from our
                            servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              deleteChatMessage(message);
                            }}
                          >
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </button>
              ) : null}

              {isAIMessage ? (
                <div className="text-sm prose prose-sm dark:prose-invert max-w-none
                  prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5
                  prose-pre:my-2 prose-pre:p-0 prose-pre:bg-transparent
                  prose-code:before:content-none prose-code:after:content-none
                  prose-code:bg-zinc-700/30 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
                  prose-a:text-blue-400 prose-a:underline
                  prose-strong:text-inherit prose-em:text-inherit
                  prose-table:text-xs prose-th:p-2 prose-td:p-2 prose-th:border prose-td:border
                  prose-th:border-zinc-600 prose-td:border-zinc-600">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ node, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        const codeString = String(children).replace(/\n$/, "");
                        if (match) {
                          return (
                            <div className="relative group/code my-2 rounded-lg overflow-hidden">
                              <div className="flex items-center justify-between bg-zinc-800 px-4 py-1.5 text-xs text-zinc-400">
                                <span>{match[1]}</span>
                                <button
                                  onClick={() => handleCopyCode(codeString)}
                                  className="flex items-center gap-1 hover:text-white transition-colors"
                                >
                                  {copiedCode === codeString ? (
                                    <><CheckIcon className="h-3.5 w-3.5" /> Copied!</>
                                  ) : (
                                    <><ClipboardDocumentIcon className="h-3.5 w-3.5" /> Copy</>
                                  )}
                                </button>
                              </div>
                              <SyntaxHighlighter
                                style={oneDark}
                                language={match[1]}
                                PreTag="div"
                                customStyle={{
                                  margin: 0,
                                  borderRadius: 0,
                                  fontSize: "0.8rem",
                                }}
                              >
                                {codeString}
                              </SyntaxHighlighter>
                            </div>
                          );
                        }
                        return (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm">{message.content}</p>
              )}
            </div>
          ) : null}
          <p
            className={classNames(
              "mt-1.5 self-end text-[10px] inline-flex items-center",
              isOwnMessage ? "dark:text-zinc-50" : "dark:text-zinc-400"
            )}
          >
            {message.attachments?.length > 0 ? (
              <PaperClipIcon className="h-4 w-4 mr-2" />
            ) : null}
            {moment(message.updatedAt).add("TIME_ZONE", "hours").fromNow(true)}{" "}
            ago
          </p>
        </div>
      </div>
    </>
  );
};

export default MessageItem;
