import { prisma } from "../../config/prisma";

export const getQuestionAnalytics = async (campaignId: string) => {
  const questions = await prisma.surveyQuestion.findMany({
    where: { campaignId },
    orderBy: { order: "asc" },
    include: {
      options: {
        orderBy: { order: "asc" },
      },
      answers: true,
    },
  });

  return questions.map((question) => {
    const totalAnswers = question.answers.length;

    if (question.type === "RATING") {
      const numericAnswers = question.answers
        .map((answer) => answer.numberValue)
        .filter((value): value is number => typeof value === "number");

      const average =
        numericAnswers.length > 0
          ? Number(
              (
                numericAnswers.reduce((sum, value) => sum + value, 0) /
                numericAnswers.length
              ).toFixed(2)
            )
          : 0;

      const distribution = question.options.map((option) => {
        const count = question.answers.filter(
          (answer) => answer.rawValue === option.value || answer.numberValue === Number(option.value)
        ).length;

        return {
          label: option.label,
          value: option.value,
          count,
          percentage:
            totalAnswers > 0 ? Number(((count / totalAnswers) * 100).toFixed(2)) : 0,
        };
      });

      return {
        questionId: question.id,
        title: question.title,
        type: question.type,
        totalAnswers,
        chartType: "bar",
        average,
        distribution,
      };
    }

    if (
      question.type === "SINGLE_CHOICE" ||
      question.type === "YES_NO" ||
      question.type === "MULTIPLE_CHOICE"
    ) {
      const distribution = question.options.map((option) => {
        const count = question.answers.filter((answer) => {
          if (question.type === "MULTIPLE_CHOICE") {
            return answer.values.includes(option.value);
          }

          return answer.optionId === option.id || answer.rawValue === option.value;
        }).length;

        return {
          label: option.label,
          value: option.value,
          count,
          percentage:
            totalAnswers > 0 ? Number(((count / totalAnswers) * 100).toFixed(2)) : 0,
        };
      });

      return {
        questionId: question.id,
        title: question.title,
        type: question.type,
        totalAnswers,
        chartType: question.type === "YES_NO" ? "pie" : "bar",
        distribution,
      };
    }

    const textAnswers = question.answers
      .filter((answer) => answer.textValue)
      .map((answer) => ({
        answerId: answer.id,
        text: answer.textValue,
        createdAt: answer.createdAt,
      }));

    return {
      questionId: question.id,
      title: question.title,
      type: question.type,
      totalAnswers,
      chartType: "text-list",
      answers: textAnswers,
    };
  });
};

export const getNpsAnalytics = async (campaignId: string) => {
  const npsQuestion = await prisma.surveyQuestion.findFirst({
    where: {
      campaignId,
      type: "RATING",
      minValue: 0,
      maxValue: 10,
    },
    include: {
      answers: true,
    },
  });

  if (!npsQuestion) {
    return null;
  }

  const scores = npsQuestion.answers
    .map((answer) => answer.numberValue)
    .filter((value): value is number => typeof value === "number");

  const total = scores.length;

  const promoters = scores.filter((score) => score >= 9).length;
  const passives = scores.filter((score) => score >= 7 && score <= 8).length;
  const detractors = scores.filter((score) => score <= 6).length;

  const nps =
    total > 0
      ? Number((((promoters - detractors) / total) * 100).toFixed(2))
      : 0;

  return {
    questionId: npsQuestion.id,
    total,
    promoters,
    passives,
    detractors,
    nps,
    chartType: "gauge",
  };
};

export const getCampaignOverviewAnalytics = async (campaignId: string) => {
  const [
    recipientsTotal,
    recipientsResponded,
    sessionsTotal,
    sessionsCompleted,
    answersTotal,
  ] = await Promise.all([
    prisma.campaignRecipient.count({ where: { campaignId } }),
    prisma.campaignRecipient.count({
      where: { campaignId, status: "RESPONDED" },
    }),
    prisma.surveySession.count({ where: { campaignId } }),
    prisma.surveySession.count({
      where: { campaignId, status: "COMPLETED" },
    }),
    prisma.surveyAnswer.count({ where: { campaignId } }),
  ]);

  return {
    recipientsTotal,
    recipientsResponded,
    sessionsTotal,
    sessionsCompleted,
    answersTotal,
    responseRate:
      recipientsTotal > 0
        ? Number(((recipientsResponded / recipientsTotal) * 100).toFixed(2))
        : 0,
    completionRate:
      sessionsTotal > 0
        ? Number(((sessionsCompleted / sessionsTotal) * 100).toFixed(2))
        : 0,
  };
};