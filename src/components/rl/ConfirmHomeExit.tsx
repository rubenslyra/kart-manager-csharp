import { useNavigate } from "@tanstack/react-router";
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

interface ConfirmHomeExitProps {
  area: "Arena" | "Oficina";
  className?: string;
}

export function ConfirmHomeExit({ area, className }: ConfirmHomeExitProps) {
  const navigate = useNavigate();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          className={
            className ??
            "corner-cut border border-border bg-background/75 px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground backdrop-blur transition-colors hover:border-primary hover:text-primary"
          }
        >
          Voltar à home
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="corner-cut border-primary/40">
        <AlertDialogHeader>
          <AlertDialogTitle>Deseja realmente sair da {area}?</AlertDialogTitle>
          <AlertDialogDescription>
            A experiência atual será fechada e você voltará para a home do projeto.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Continuar aqui</AlertDialogCancel>
          <AlertDialogAction onClick={() => navigate({ to: "/" })}>
            Sair para home
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
