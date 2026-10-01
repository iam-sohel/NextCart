FROM eclipse-temurin:21-jre

WORKDIR /app

# Create a non-root user for Havlook
RUN groupadd --system havlook && \
    useradd --system --gid havlook --create-home havlook

# Copy the application JAR
COPY target/*.jar app.jar

# Give ownership to the Havlook user
RUN chown -R havlook:havlook /app

# Run the application as non-root
USER havlook

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]