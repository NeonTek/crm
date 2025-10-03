"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import type { ClientRequest } from "@/lib/types";
import { Lightbulb, Plus } from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { TaskForm } from "./task-form";

type StatusColumn = "new" | "under-review" | "approved" | "declined";

export function RequestList() {
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [requestToConvert, setRequestToConvert] =
    useState<ClientRequest | null>(null);
  const { toast } = useToast();

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/requests", { cache: "no-store" });
      if (res.ok) setRequests(await res.json());
    } catch (error) {
      console.error("Failed to fetch requests", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) {
      return;
    }

    const originalRequests = [...requests];
    const updatedRequests = requests.map((req) =>
      req.id === draggableId
        ? { ...req, status: destination.droppableId as StatusColumn }
        : req
    );
    setRequests(updatedRequests);

    try {
      const res = await fetch(`/api/requests/${draggableId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: destination.droppableId }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast({
        title: "Status Updated",
        description: "The request status has been changed.",
      });
    } catch (error) {
      setRequests(originalRequests);
      toast({
        title: "Error",
        description: "Could not update status.",
        variant: "destructive",
      });
    }
  };

  const handleConvertToTask = (request: ClientRequest) => {
    setRequestToConvert(request);
    setShowTaskForm(true);
  };

  if (showTaskForm && requestToConvert) {
    return (
      <TaskForm
        task={{
          id: "",
          title: requestToConvert.title,
          description: requestToConvert.description,
          projectId: "",
          status: "todo",
          priority: "medium",
          createdAt: "",
          updatedAt: "",
        }}
        onSuccess={() => {
          toast({
            title: "Task Created!",
            description: "The client request has been converted to a task.",
          });
          setShowTaskForm(false);
          setRequestToConvert(null);
          fetch(`/api/requests/${requestToConvert.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "approved" }),
          }).then(() => fetchRequests());
        }}
        onCancel={() => {
          setShowTaskForm(false);
          setRequestToConvert(null);
        }}
      />
    );
  }

  const columns: Record<StatusColumn, string> = {
    new: "New",
    "under-review": "Under Review",
    approved: "Approved",
    declined: "Declined",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Client Ideas & Requests</h2>
      </div>
      <p className="text-muted-foreground">
        Review, manage, and convert client submissions into actionable tasks.
      </p>

      {isLoading ? (
        <p>Loading requests...</p>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
            {Object.keys(columns).map((columnId) => (
              <Droppable droppableId={columnId} key={columnId}>
                {(provided, snapshot) => (
                  <Card
                    className={`transition-colors ${
                      snapshot.isDraggingOver ? "bg-muted/80" : "bg-muted/40"
                    }`}
                  >
                    <CardHeader>
                      <CardTitle>{columns[columnId as StatusColumn]}</CardTitle>
                    </CardHeader>
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="space-y-4 min-h-[200px] p-6 pt-0" 
                    >
                      <CardContent className="p-0">
                        {" "}
                        {/* Removed padding from CardContent */}
                        {requests
                          .filter((req) => req.status === columnId)
                          .map((request, index) => (
                            <Draggable
                              key={request.id}
                              draggableId={request.id}
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="mb-4" // Add margin between draggable items
                                >
                                  <Card className="bg-background">
                                    <CardContent className="p-4 space-y-2">
                                      <p className="font-semibold">
                                        {request.title}
                                      </p>
                                      <p className="text-sm text-muted-foreground line-clamp-3">
                                        {request.description}
                                      </p>
                                      <p className="text-xs text-muted-foreground pt-2 border-t">
                                        From:{" "}
                                        <strong>{request.clientName}</strong>
                                      </p>
                                      {request.status === "approved" && (
                                        <Button
                                          size="sm"
                                          className="w-full mt-2"
                                          onClick={() =>
                                            handleConvertToTask(request)
                                          }
                                        >
                                          <Plus className="h-4 w-4 mr-2" />
                                          Convert to Task
                                        </Button>
                                      )}
                                    </CardContent>
                                  </Card>
                                </div>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </CardContent>
                    </div>
                    {/* --- END OF FIX --- */}
                  </Card>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      )}
    </div>
  );
}
