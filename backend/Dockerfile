FROM eclipse-temurin:21-jre

WORKDIR /app

RUN groupadd --system nextcart && \
    useradd --system --gid nextcart --create-home nextcart

COPY target/*.jar app.jar

RUN chown -R nextcart:nextcart /app

USER nextcart

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
