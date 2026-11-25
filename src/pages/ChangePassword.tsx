import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useChangePassword } from "../api/hooks";
import { Button, Card, Field, Input } from "../components/ui";

interface Form {
  old_password: string;
  new_password: string;
  confirm: string;
}

export default function ChangePassword() {
  const { t } = useTranslation();
  const mut = useChangePassword();
  const { register, handleSubmit, reset, getValues, formState: { errors } } = useForm<Form>();

  const onSubmit = handleSubmit((v) =>
    mut.mutate({ old_password: v.old_password, new_password: v.new_password }, { onSuccess: () => reset() }),
  );

  return (
    <Card title={t("password.title")} className="max-w-lg">
      <form onSubmit={onSubmit} className="space-y-5">
        <Field label={t("password.current")} htmlFor="old" error={errors.old_password?.message}>
          <Input id="old" type="password" dir="ltr" autoComplete="current-password" {...register("old_password", { required: t("password.required") })} />
        </Field>
        <Field label={t("password.new")} htmlFor="new" hint={t("password.min")} error={errors.new_password?.message}>
          <Input id="new" type="password" dir="ltr" autoComplete="new-password" {...register("new_password", { required: t("password.required"), minLength: { value: 6, message: t("password.min") } })} />
        </Field>
        <Field label={t("password.confirm")} htmlFor="confirm" error={errors.confirm?.message}>
          <Input id="confirm" type="password" dir="ltr" autoComplete="new-password" {...register("confirm", { required: t("password.required"), validate: (v) => v === getValues("new_password") || t("password.mismatch") })} />
        </Field>
        <Button type="submit" loading={mut.isPending}>{t("common.save")}</Button>
      </form>
    </Card>
  );
}
