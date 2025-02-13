import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface Step {
  title: string;
  content: ReactNode;
  isValid: boolean;
}

interface MultiStepFormProps {
  steps: Step[];
  onComplete: () => void;
  isSubmitting?: boolean;
}

export default function MultiStepForm({ 
  steps, 
  onComplete,
  isSubmitting = false 
}: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const back = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between mb-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex-1 text-center ${
                index < steps.length - 1 ? "relative" : ""
              }`}
            >
              <div
                className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center border-2 
                ${
                  index <= currentStep
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted border-muted-foreground"
                }`}
              >
                {index + 1}
              </div>
              <div className="mt-2 text-sm font-medium">{step.title}</div>
              {index < steps.length - 1 && (
                <div className="absolute top-4 left-1/2 w-full h-0.5 bg-muted-foreground/30" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="min-h-[300px]">{steps[currentStep].content}</div>

      <div className="mt-8 flex justify-between">
        <Button
          variant="outline"
          onClick={back}
          disabled={currentStep === 0 || isSubmitting}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        <Button
          onClick={next}
          disabled={!steps[currentStep].isValid || isSubmitting}
          className="gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : currentStep === steps.length - 1 ? (
            "Submit"
          ) : (
            <>
              Next <ChevronRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}